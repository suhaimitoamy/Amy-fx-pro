package com.amyelitesuite

import java.net.URI

/** A replay workspace owns vertical swipes even when the WebView is at scrollY=0. */
internal object ReplayRefreshPolicy {
    private const val REPLAY_PATH = "/assets/apps/academy/trading-practice/candle-replay.html"

    fun blocksPullToRefresh(url: String?): Boolean {
        if (url.isNullOrBlank()) return false
        return runCatching { URI(url).normalize().path == REPLAY_PATH }.getOrDefault(false)
    }
}
