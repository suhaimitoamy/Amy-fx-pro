package com.amyelitesuite

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingWorkPolicy
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.time.Instant
import java.util.concurrent.TimeUnit

/**
 * Lightweight background worker that runs only while at least one Custom Price Alarm is ACTIVE,
 * checking latest XAU/USD 1-min prices so alarms pop up even when Amy FX Pro is closed.
 */
class PriceAlertSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(12, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        if (!PriceAlertNativeEvaluator.hasActiveAlerts(applicationContext)) {
            return@withContext Result.success()
        }

        val nowMs = System.currentTimeMillis()
        if (!AmyFxNotificationGate.isGoldMarketOpen(nowMs) || !SessionClock.isGoldMarketOpen()) {
            scheduleNext(applicationContext, delaySeconds = 900L)
            return@withContext Result.success()
        }

        try {
            val request = Request.Builder()
                .url(PRICE_URL)
                .header("Accept", "application/json")
                .build()

            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    val payload = JSONObject(response.body?.string().orEmpty())
                    val values = payload.optJSONArray("values")
                    if (values != null && values.length() > 0) {
                        // values[0] is newest bar; evaluate oldest->newest in the small 3-bar slice
                        for (idx in (values.length() - 1) downTo 0) {
                            val bar = values.optJSONObject(idx) ?: continue
                            if (bar.optBoolean("amyfxSyntheticCurrent", false) || bar.optBoolean("synthetic", false)) {
                                continue
                            }
                            val close = bar.optString("close").toDoubleOrNull() ?: continue
                            val high = bar.optString("high").toDoubleOrNull() ?: close
                            val low = bar.optString("low").toDoubleOrNull() ?: close
                            val openMs = parseIsoUtcMillis(bar.optString("datetime"))
                            PriceAlertNativeEvaluator.evaluate(
                                context = applicationContext,
                                currentPrice = close,
                                windowHigh = high,
                                windowLow = low,
                                windowFromMs = openMs,
                                nowMs = nowMs
                            )
                        }
                    }
                }
            }
        } catch (error: Exception) {
            android.util.Log.w("AmyFX-PriceAlertWorker", "Background price alert check failed", error)
        } finally {
            if (PriceAlertNativeEvaluator.hasActiveAlerts(applicationContext)) {
                scheduleNext(applicationContext, delaySeconds = 60L)
            }
        }

        Result.success()
    }

    private fun parseIsoUtcMillis(raw: String?): Long {
        val text = raw?.trim().orEmpty()
        if (text.isEmpty()) return 0L
        return try {
            val normalized = if (text.endsWith("Z") || text.contains("+")) {
                text.replace(" ", "T")
            } else {
                "${text.replace(" ", "T")}Z"
            }
            Instant.parse(normalized).toEpochMilli()
        } catch (_: Exception) {
            0L
        }
    }

    companion object {
        const val UNIQUE_WORK_NAME = "amy_fx_price_alert_monitor"
        private const val PRICE_URL = "https://amy-fx.vercel.app/api/twelvedata?symbol=XAU/USD&interval=1min&outputsize=3"

        fun scheduleNext(context: Context, delaySeconds: Long = 60L) {
            if (!PriceAlertNativeEvaluator.hasActiveAlerts(context)) return
            val request = OneTimeWorkRequestBuilder<PriceAlertSyncWorker>()
                .setInitialDelay(delaySeconds.coerceAtLeast(15L), TimeUnit.SECONDS)
                .setConstraints(
                    Constraints.Builder()
                        .setRequiredNetworkType(NetworkType.CONNECTED)
                        .build()
                )
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                UNIQUE_WORK_NAME,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }

        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(UNIQUE_WORK_NAME)
        }
    }
}
