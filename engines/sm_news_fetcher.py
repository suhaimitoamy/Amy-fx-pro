#!/usr/bin/env python3
"""
SM News 24 Live Fetcher
=======================
Mengambil siaran berita makro & geopolitik terkini dari channel publik Telegram SM News (@sm_news_24h).
Menyediakan ringkasan cepat untuk menguatkan konfluensi bias fundamental Gold (XAU/USD).
"""

import sys
import re
import json
import urllib.request
from bs4 import BeautifulSoup
from datetime import datetime, timezone, timedelta

CHANNEL_URL = "https://t.me/s/sm_news_24h"

def get_latest_news(limit: int = 5) -> list[dict]:
    req = urllib.request.Request(
        CHANNEL_URL,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    )
    results = []
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode("utf-8")
            soup = BeautifulSoup(html, "html.parser")
            messages = soup.find_all("div", class_="tgme_widget_message")
            
            for msg in reversed(messages):
                text_el = msg.find("div", class_="tgme_widget_message_text")
                if not text_el:
                    continue
                time_el = msg.find("time")
                time_raw = time_el["datetime"] if time_el else ""
                
                time_wita_str = ""
                if time_raw:
                    try:
                        dt_utc = datetime.fromisoformat(time_raw)
                        dt_wita = dt_utc.astimezone(timezone(timedelta(hours=8)))
                        time_wita_str = dt_wita.strftime("%Y-%m-%d %H:%M WITA")
                    except Exception:
                        time_wita_str = time_raw

                text = text_el.get_text("\n", strip=True)
                
                # Saring promo bot internal jika ada
                clean_text = re.sub(r"@\w+(_Bot|_bot)", "", text).strip()
                
                results.append({
                    "time_wita": time_wita_str,
                    "content": clean_text
                })
                if len(results) >= limit:
                    break
    except Exception as e:
        results.append({
            "error": str(e)
        })
    return results

if __name__ == "__main__":
    news = get_latest_news(limit=4)
    print(json.dumps(news, indent=2, ensure_ascii=False))
