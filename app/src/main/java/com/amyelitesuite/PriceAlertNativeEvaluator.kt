package com.amyelitesuite

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONObject
import java.util.Locale

/**
 * Native background & cross-screen evaluator for user-created Custom Price Alarms
 * (`amyfx_custom_price_alerts`), ensuring pop-up notifications still fire when Amy FX Pro
 * is minimized, closed, or on another module.
 */
object PriceAlertNativeEvaluator {
    private const val PREFS = "amy_custom_price_alerts_native"
    private const val KEY_ALERTS_JSON = "alerts_json"
    const val CHANNEL_ID = "amy_price_alarm_v1"

    private val lock = Any()

    fun syncAlerts(context: Context, alertsJson: String?) {
        val appContext = context.applicationContext
        val safeJson = try {
            val raw = alertsJson?.trim().orEmpty()
            if (raw.isEmpty()) "[]" else JSONArray(raw).toString()
        } catch (_: Exception) {
            "[]"
        }
        synchronized(lock) {
            appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_ALERTS_JSON, safeJson)
                .commit()
        }
        if (hasActiveAlerts(appContext)) {
            PriceAlertSyncWorker.scheduleNext(appContext, delaySeconds = 45L)
        } else {
            PriceAlertSyncWorker.cancel(appContext)
        }
    }

    fun getAlertsJson(context: Context): String {
        val appContext = context.applicationContext
        synchronized(lock) {
            return appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(KEY_ALERTS_JSON, "[]")
                ?.takeIf { it.isNotBlank() }
                ?: "[]"
        }
    }

    fun hasActiveAlerts(context: Context): Boolean {
        val arr = try {
            JSONArray(getAlertsJson(context))
        } catch (_: Exception) {
            return false
        }
        for (i in 0 until arr.length()) {
            val obj = arr.optJSONObject(i) ?: continue
            if (obj.optString("status", "") == "ACTIVE" && obj.optDouble("targetPrice", 0.0) > 0.0) {
                return true
            }
        }
        return false
    }

    fun evaluate(
        context: Context,
        currentPrice: Double,
        windowHigh: Double = 0.0,
        windowLow: Double = 0.0,
        windowFromMs: Long = 0L,
        nowMs: Long = System.currentTimeMillis()
    ): Boolean {
        if (!currentPrice.isFinite() || currentPrice <= 0.0) return false
        if (!AmyFxNotificationGate.isGoldMarketOpen(nowMs)) return false

        val appContext = context.applicationContext
        val triggeredToNotify = mutableListOf<JSONObject>()
        var changed = false

        synchronized(lock) {
            val prefs = appContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val raw = prefs.getString(KEY_ALERTS_JSON, "[]").orEmpty()
            val arr = try {
                if (raw.isBlank()) JSONArray() else JSONArray(raw)
            } catch (_: Exception) {
                JSONArray()
            }
            if (arr.length() == 0) return false

            for (i in 0 until arr.length()) {
                val alert = arr.optJSONObject(i) ?: continue
                if (alert.optString("status", "") != "ACTIVE") continue
                val target = alert.optDouble("targetPrice", 0.0)
                if (!target.isFinite() || target <= 0.0) continue

                val direction = alert.optString("direction", "CROSS_ABOVE")
                val createdAt = alert.optLong("createdAt", 0L)
                val lastChecked = alert.optDouble("lastCheckedPrice", 0.0)
                val createdPrice = alert.optDouble("createdPrice", 0.0)
                val prev = when {
                    lastChecked.isFinite() && lastChecked > 0.0 -> lastChecked
                    createdPrice.isFinite() && createdPrice > 0.0 -> createdPrice
                    else -> currentPrice
                }

                val canUseWindow = windowFromMs > 0L && windowFromMs >= createdAt
                val checkHigh = if (canUseWindow && windowHigh.isFinite() && windowHigh > 0.0) {
                    maxOf(currentPrice, windowHigh)
                } else {
                    currentPrice
                }
                val checkLow = if (canUseWindow && windowLow.isFinite() && windowLow > 0.0) {
                    minOf(currentPrice, windowLow)
                } else {
                    currentPrice
                }

                val isTriggered = when (direction) {
                    "CROSS_BELOW" -> prev > target && checkLow <= target
                    else -> prev < target && checkHigh >= target
                }

                if (lastChecked != currentPrice) {
                    alert.put("lastCheckedPrice", currentPrice)
                    changed = true
                }

                if (isTriggered) {
                    alert.put("status", "TRIGGERED")
                    alert.put("triggeredAt", nowMs)
                    changed = true
                    triggeredToNotify.add(JSONObject(alert.toString()))
                }
            }

            if (changed) {
                prefs.edit().putString(KEY_ALERTS_JSON, arr.toString()).commit()
            }
        }

        for (alert in triggeredToNotify) {
            showAlarmNotification(appContext, alert, currentPrice)
        }
        return triggeredToNotify.isNotEmpty()
    }

    private fun showAlarmNotification(context: Context, alert: JSONObject, currentPrice: Double) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val alertId = alert.optString("id", "alarm_${System.currentTimeMillis()}")
        val target = alert.optDouble("targetPrice", currentPrice)
        val note = alert.optString("note", "").trim()
        val priceStr = String.format(Locale.US, "%.2f", currentPrice)
        val targetStr = String.format(Locale.US, "%.2f", target)

        val isIctSweep = note.contains("SSL", ignoreCase = true) ||
            note.contains("BSL", ignoreCase = true) ||
            note.contains("Sweep", ignoreCase = true)
        val isPoi = note.contains("POI", ignoreCase = true) || note.contains("Zone", ignoreCase = true)

        val title = when {
            isIctSweep -> "${note.substringBefore("(").trim()}: XAU/USD $$priceStr"
            isPoi -> "${note.substringBefore("(").trim()}: XAU/USD $$priceStr"
            note.isNotBlank() && note != "Alarm Target Harga" -> "$note: XAU/USD $$priceStr"
            else -> "🔔 Alarm Harga: XAU/USD Menyentuh $priceStr"
        }
        val body = when {
            isIctSweep -> "Level Likuiditas $targetStr telah tersapu (Sweep)! Pantau reaksi konfirmasi di chart."
            isPoi -> "Harga menyentuh area POI $$targetStr. Cek konfirmasi entry."
            else -> "Target harga $targetStr telah tercapai! Pantau aksi harga di chart."
        }

        createAlarmChannel(context)
        val targetUrl = "https://appassets.androidplatform.net/assets/apps/mapping/index.html#Dashboard"
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("target_url", targetUrl)
            putExtra("amyfx_route", "Dashboard")
        }
        val reqCode = alertId.hashCode()
        val pendingIntent = PendingIntent.getActivity(
            context,
            reqCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_amy_fx)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notifId = 90000 + Math.abs(alertId.hashCode() % 9000)
        manager.notify(notifId, notification)
    }

    fun createAlarmChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val goldAudioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        val goldSoundUri = Uri.parse("android.resource://${context.packageName}/${R.raw.amy_gold_chime}")
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Amy FX Alarm Harga Kustom",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifikasi pop-up alarm target harga XAU/USD di Peta Harga dan Chart Gold"
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 220, 120, 260)
            enableLights(true)
            lightColor = Color.rgb(245, 196, 81)
            setShowBadge(true)
            setSound(goldSoundUri, goldAudioAttributes)
        }
        manager.createNotificationChannel(channel)
    }
}
