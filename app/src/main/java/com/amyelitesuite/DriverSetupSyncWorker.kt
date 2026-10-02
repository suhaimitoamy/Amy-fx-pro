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

                val contextObj = payload.optJSONObject("context") ?: result?.optJSONObject("context")
                if (contextObj != null) {
                    processAssistantAlerts(contextObj)
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

    private fun processAssistantAlerts(contextObj: JSONObject) {
        val amy = contextObj.optJSONObject("amy") ?: return
        val dashboard = amy.optJSONObject("dashboard")
        val entry = amy.optJSONObject("entry")
        val news = contextObj.optJSONObject("news")

        val entryText = entry?.optString("text").orEmpty()
        val lines = entryText.split("\n")
            .map { it.trim() }
            .filter { it.isNotBlank() }

        var notify = false
        var badge = ""
        var notifTitle = ""
        var notifBody = ""

        val newsStatus = news?.optString("status").orEmpty()
        val invalidStatus = dashboard?.optInt("invalidStatus", 0) ?: 0
        val rejectBuy = entry?.optBoolean("rejectBuy", false) ?: false
        val rejectSell = entry?.optBoolean("rejectSell", false) ?: false
        val importance = entry?.optInt("importance", 0) ?: 0
        val inPoi = entry?.optBoolean("inPoi", false) ?: false
        val dolStatus = dashboard?.optInt("dolStatus", 0) ?: 0
        val biasDir = dashboard?.optInt("biasDir", 0) ?: 0

        val poi = dashboard?.optJSONObject("poi")
        val poiKind = poi?.optString("kind", "POI")?.ifBlank { "POI" } ?: "POI"
        val poiSide = poi?.optString("side", "").orEmpty()

        if (newsStatus == "NEWS_LOCK") {
            badge = "NEWS_LOCK"
            notifTitle = "🛡️ Asisten Amy: NEWS LOCK Aktif"
            notifBody = news?.optString("note", "Pasar sangat liar dan rawan slippage. Jangan entry sebelum volatilitas stabil.").orEmpty()
            notify = true
        } else if (invalidStatus == 2) {
            badge = "SETUP_BATAL"
            notifTitle = "⚠ Asisten Amy: Setup Batal (Invalid)"
            val invalidLevel = dashboard?.optDouble("invalidLevel", 0.0) ?: 0.0
            val levelStr = if (invalidLevel > 0.0) String.format(java.util.Locale.US, "%.2f", invalidLevel) else ""
            notifBody = "Close M15 menembus batas pembatalan $levelStr. Tunggu pembentukan struktur baru."
            notify = true
        } else if (rejectBuy || rejectSell) {
            val isBuy = rejectBuy
            badge = if (isBuy) "REJECTION_BUY" else "REJECTION_SELL"
            val badgeLabel = if (isBuy) "REJECTION BUY" else "REJECTION SELL"
            notifTitle = "🔥 Asisten Amy: $badgeLabel"
            val primary = "🔥 Rejection Kuat di Area $poiKind"
            val sub = "Candle menolak ${if (isBuy) "bawah" else "atas"} dengan wick panjang. Konfirmasi ${if (isBuy) "BUY" else "SELL"}."
            notifBody = "$primary. $sub"
            notify = true
        } else if (importance == 4) {
            val isBull = biasDir == 1
            badge = if (isBull) "VALID_BREAK_UP" else "VALID_BREAK_DOWN"
            val badgeLabel = if (isBull) "VALID BREAK UP" else "VALID BREAK DOWN"
            notifTitle = "✓ Asisten Amy: $badgeLabel"
            val primary = "✓ Valid Break ${if (isBull) "Bullish" else "Bearish"} dengan Displacement"
            val sub = "Struktur M5 terkonfirmasi searah tren. Siapkan observasi entry."
            notifBody = "$primary. $sub"
            notify = true
        } else if (lines.any { it.contains("swept", ignoreCase = true) }) {
            val isSsl = lines.any { it.contains("SSL", ignoreCase = true) }
            badge = if (isSsl) "SSL_SWEPT" else "BSL_SWEPT"
            val badgeLabel = if (isSsl) "SSL SWEPT" else "BSL SWEPT"
            notifTitle = "💧 Asisten Amy: $badgeLabel"
            val primary = "💧 ${if (isSsl) "Sell-Side (SSL)" else "Buy-Side (BSL)"} Swept di M5"
            val sweepLine = lines.find { it.contains("swept", ignoreCase = true) } ?: ""
            val followLine = lines.find { it.contains("konfirmasi", ignoreCase = true) } ?: "Likuiditas terambil, pantau reaksi harga."
            val sub = "$sweepLine · $followLine".trim(' ', '·')
            notifBody = "$primary. $sub"
            notify = true
        } else if (inPoi) {
            badge = "DI_AREA_POI"
            notifTitle = "📍 Asisten Amy: Area POI Tersentuh"
            val primary = "📍 ${if (poiSide.isNotBlank()) "$poiSide " else ""}$poiKind Tersentuh"
            val low = poi?.optDouble("low", 0.0) ?: 0.0
            val high = poi?.optDouble("high", 0.0) ?: 0.0
            val rangeStr = if (high > 0.0 && low > 0.0) String.format(java.util.Locale.US, "(%.2f – %.2f)", high, low) else ""
            val sub = "Harga berada di zona kritis. Pantau pembentukan candle rejection atau break M5."
            notifBody = "$primary $rangeStr. $sub"
            notify = true
        } else if (dolStatus == 2) {
            badge = "TARGET_DOL"
            notifTitle = "🎯 Asisten Amy: Target DOL Tercapai"
            notifBody = "🎯 Target Likuiditas (DOL) Telah Tercapai. Hati-hati pembalikan arah, jangan kejar harga."
            notify = true
        }

        if (!notify || notifTitle.isBlank() || notifBody.isBlank()) return

        val sourceObj = amy.optJSONObject("source") ?: contextObj.optJSONObject("source")
        val m5Time = sourceObj?.optLong("M5", 0L) ?: (System.currentTimeMillis() / (5 * 60 * 1000))
        val cacheKey = "assistant_${badge}_${m5Time}"
        val prefs = applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (prefs.contains(cacheKey)) return

        showDriverNotification(notifTitle, notifBody, cacheKey)
        prefs.edit().putLong(cacheKey, System.currentTimeMillis()).apply()
    }

    private fun showDriverNotification(title: String, body: String, targetId: String) {
        if (!canPostNotifications()) return

        val gateKey = "driver_worker|$targetId|$title"
        if (!AmyFxNotificationGate.shouldNotify(applicationContext, gateKey, System.currentTimeMillis())) {
            return
        }
        AmyFxNotificationGate.markNotified(applicationContext, "global|$title|$body", System.currentTimeMillis())

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
