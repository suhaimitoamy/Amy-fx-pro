package com.amyelitesuite

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class DriverSetupSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url(SETUPS_URL)
                .header("Accept", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext Result.retry()

                val payload = JSONObject(response.body?.string().orEmpty())
                if (!payload.optBoolean("ok", false)) return@withContext Result.success()

                val active = payload.optJSONArray("active")
                if (active != null && active.length() > 0) {
                    processActiveSetups(active)
                }

                val engine = payload.optJSONObject("engine")
                val result = engine?.optJSONObject("result")
                if (result != null) {
                    processMarketAlerts(result)
                }

                Result.success()
            }
        } catch (error: Exception) {
            android.util.Log.w("AmyFX-DriverWorker", "Driver setup sync failed", error)
            Result.retry()
        }
    }

    private fun processActiveSetups(active: org.json.JSONArray) {
        val prefs = applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        for (i in 0 until active.length()) {
            val item = active.optJSONObject(i) ?: continue
            val id = item.optString("id").trim()
            if (id.isBlank()) continue

            val status = item.optString("status", "WAITING_TRIGGER")
            val cacheKey = "notified_${id}_${status}"
            if (prefs.contains(cacheKey)) continue

            val driverName = item.optString("driverName").ifBlank {
                item.optString("model", "Gold Driver")
            }
            val direction = item.optString("direction", "SELL")
            val entry = item.optDouble("entry", 0.0)
            val sl = item.optDouble("stopLoss", 0.0)
            val tp = item.optDouble("target", 0.0)

            val statusLabel = when (status) {
                "WAITING_TRIGGER" -> "Rencana Limit"
                "WAITING_NEXT_OPEN" -> "Menunggu Open"
                "ARMED" -> "Menunggu Retest"
                "CONFIRMED" -> "Terkonfirmasi"
                "ACTIVE" -> "Aktif"
                else -> status
            }

            val title = "⚡ Setup Driver: $driverName ($direction)"
            val body = if (entry > 0) {
                String.format("%s · Entry %.2f · SL %.2f · TP %.2f", statusLabel, entry, sl, tp)
            } else {
                "$statusLabel · Periksa chart untuk level acuan."
            }

            showDriverNotification(title, body, id)
            prefs.edit().putLong(cacheKey, System.currentTimeMillis()).apply()
        }
    }

    private fun processMarketAlerts(result: JSONObject) {
        val prefs = applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val news = result.optJSONObject("news")
        if (news?.optString("status") == "NEWS_LOCK") {
            val newsKey = "news_lock_" + (news.optString("note").hashCode())
            if (!prefs.contains(newsKey)) {
                showDriverNotification(
                    "🛡️ Tahan Dulu: Pasar Lagi Liar",
                    news.optString("note", "Ada rilis berita USD berdampak tinggi. Menunda eksekusi."),
                    "news_lock"
                )
                prefs.edit().putLong(newsKey, System.currentTimeMillis()).apply()
            }
        }
    }

    private fun showDriverNotification(title: String, body: String, targetId: String) {
        if (!canPostNotifications()) return

        val gateKey = "driver_worker|$targetId|$title"
        if (!AmyFxNotificationGate.shouldNotify(applicationContext, gateKey, System.currentTimeMillis())) {
            return
        }

        createMarketContextChannel()
        val targetUrl = "https://appassets.androidplatform.net/assets/apps/mapping/index.html#Dashboard"
        val intent = Intent(applicationContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("target_url", targetUrl)
            putExtra("amyfx_route", "Mapping")
        }
        val requestCode = (targetId + title).hashCode()
        val pendingIntent = PendingIntent.getActivity(
            applicationContext,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(applicationContext, AmyFxApplication.MARKET_CONTEXT_CHANNEL_ID)
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

        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(AmyFxNotificationGate.stableId(gateKey, requestCode), notification)
    }

    private fun createMarketContextChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = NotificationChannel(
            AmyFxApplication.MARKET_CONTEXT_CHANNEL_ID,
            "Amy FX Market Context",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Perubahan struktur, area penting, dan setup driver Gold XAU/USD"
            enableVibration(true)
            enableLights(true)
            lightColor = Color.rgb(212, 175, 55)
            setShowBadge(true)
        }
        manager.createNotificationChannel(channel)
    }

    private fun canPostNotifications(): Boolean {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(applicationContext, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
    }

    companion object {
        const val UNIQUE_WORK_NAME = "amy_fx_driver_setup_sync"
        private const val SETUPS_URL = "https://amy-fx.vercel.app/api/scalper-setups?limit=10"
        private const val PREFS = "amy_driver_worker_prefs"
    }
}
