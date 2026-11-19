#!/usr/bin/env python3
"""
Hermes Telegram AI Assistant (@Hermesamygmgobot)
Asisten Trading & Pendamping Pribadi untuk Sayang AMY.
Suara & Karakter: Antigravity (Narasi Scalper Murni, Mengalir, Santai, Tanpa Format Kaku).
Dukungan: Obrolan Teks & Pesan Suara 2 Arah (Voice Note).
"""

import os
import sys
import time
import json
import base64
import sqlite3
import traceback
import subprocess
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

# Konfigurasi
BOT_TOKEN = "8827515189:AAF4YNT10yS-uWfxstdLU_YHS-Z5Vl7uXfc"
ALLOWED_USER_ID = 1351889730  # Sayang AMY
GEMINI_API_KEY = "AIzaSyAiB-yJ-wg6Pbd_dPiaO1Q7ZJ_DzLjqsTs"
TWELVEDATA_API_KEY = "d3d344540ec04935bf6790f0f856fdf5"
DB_PATH = "/root/amy-market-data/xauusd_bot.sqlite"
TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Memory chat session (ram)
chat_history = []
last_market_fetch = 0
cached_market_data = ""

def get_current_time_str():
    wita = timezone(timedelta(hours=8))
    now = datetime.now(wita)
    return now.strftime("%A, %d %B %Y - %H:%M:%S WITA")

def send_chat_action(chat_id, action="typing"):
    try:
        url = f"{TELEGRAM_API_URL}/sendChatAction"
        data = urllib.parse.urlencode({"chat_id": chat_id, "action": action}).encode()
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass

def send_telegram_message(chat_id, text):
    try:
        url = f"{TELEGRAM_API_URL}/sendMessage"
        chunks = [text[i:i+3900] for i in range(0, len(text), 3900)]
        for chunk in chunks:
            payload = {
                "chat_id": chat_id,
                "text": chunk,
                "parse_mode": "Markdown"
            }
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
            try:
                urllib.request.urlopen(req, timeout=10)
            except urllib.error.HTTPError:
                # Fallback tanpa markdown jika ada simbol bentrok
                payload.pop("parse_mode", None)
                data = json.dumps(payload).encode('utf-8')
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=10)
    except Exception as e:
        print(f"[Error send_telegram_message] {e}", flush=True)

def download_telegram_file(file_id):
    """Download audio file dari server Telegram."""
    try:
        url = f"{TELEGRAM_API_URL}/getFile?file_id={file_id}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        if not data.get("ok"):
            return None
        file_path = data["result"]["file_path"]
        download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"
        req_dl = urllib.request.Request(download_url)
        with urllib.request.urlopen(req_dl, timeout=20) as dl_resp:
            return dl_resp.read()
    except Exception as e:
        print(f"[Error download_telegram_file] {e}", flush=True)
        return None

def send_telegram_voice(chat_id, text, voice_name="Aoede"):
    """Generate audio voice note lewat Gemini TTS dan kirim via Telegram sendVoice."""
    try:
        # Bersihkan formatting markdown untuk pembacaan audio
        clean_text = text.replace("*", "").replace("#", "").replace("`", "").replace("_", "")
        audio_prompt_text = clean_text[:500]

        url_tts = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": audio_prompt_text}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": voice_name
                        }
                    }
                }
            }
        }
        req = urllib.request.Request(url_tts, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=20) as r:
            res = json.loads(r.read().decode())
            b64_audio = res['candidates'][0]['content']['parts'][0]['inlineData']['data']
            raw_pcm = base64.b64decode(b64_audio)

        out_ogg = f"/tmp/tg_voice_{int(time.time()*1000)}.ogg"
        cmd = [
            'ffmpeg', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', 'pipe:0',
            '-c:a', 'libopus', '-b:a', '32k', '-f', 'ogg', out_ogg
        ]
        p = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        p.communicate(input=raw_pcm)

        if not os.path.exists(out_ogg):
            return False

        boundary = f"----WebKitFormBoundary{int(time.time()*1000)}"
        body = bytearray()
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n{chat_id}\r\n'.encode())
        body.extend(f'--{boundary}\r\nContent-Disposition: form-data; name="voice"; filename="voice.ogg"\r\nContent-Type: audio/ogg\r\n\r\n'.encode())
        with open(out_ogg, 'rb') as f:
            body.extend(f.read())
        body.extend(f'\r\n--{boundary}--\r\n'.encode())

        req_tg = urllib.request.Request(
            f"{TELEGRAM_API_URL}/sendVoice",
            data=body,
            headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
        )
        with urllib.request.urlopen(req_tg, timeout=20) as r_tg:
            pass

        try:
            os.remove(out_ogg)
        except Exception:
            pass
        return True
    except Exception as e:
        print(f"[Error send_telegram_voice] {e}", flush=True)
        return False

def get_market_data():
    """Ambil data real-time Twelve Data & M5 SQLite untuk referensi fakta internal."""
    global last_market_fetch, cached_market_data
    now = time.time()
    if now - last_market_fetch < 30 and cached_market_data:
        return cached_market_data

    price = 3993.61
    is_open = False
    
    # Twelve Data
    try:
        url = f"https://api.twelvedata.com/quote?symbol=XAU/USD&apikey={TWELVEDATA_API_KEY}"
        req = urllib.request.Request(url, headers={"User-Agent": "AmyFX/1.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            if "close" in data:
                price = float(data.get("close", price))
                is_open = data.get("is_market_open", False)
    except Exception:
        pass

    status_str = "Sedang Buka" if is_open else "Tutup Akhir Pekan (Buka Kembali Senin)"

    # Tarik SM News 24 untuk bias fundamental makro
    news_summary = ""
    try:
        from sm_news_fetcher import get_latest_news
        news_items = get_latest_news(limit=3)
        if news_items and not news_items[0].get("error"):
            news_lines = [f"  * [{item.get('time_wita', '')}] {item.get('content', '')[:120]}..." for item in news_items]
            news_summary = "\n- Feed Berita Terkini SM News 24 (@sm_news_24h):\n" + "\n".join(news_lines)
    except Exception:
        pass

    # Tarik Mesin Analisis AMY CONTEXT V4.3.2
    amy_v432_summary = ""
    try:
        from amy_context_v432 import analyze_amy_context_v432
        v432 = analyze_amy_context_v432(symbol="XAU/USD")
        if v432 and "dashboard_rows" in v432:
            d = v432["dashboard_rows"]
            amy_v432_summary = (
                f"- AMY CONTEXT V4.3.2 Dashboard:\n"
                f"  * Status: {d.get('0_status', '')}\n"
                f"  * 3-TF Bias: {d.get('1_3tf_bias', '')}\n"
                f"  * Fase Market: {d.get('2_fase_market', '')}\n"
                f"  * Range & Posisi: {d.get('3_range_pos', '')}\n"
                f"  * Batas CHoCH / Invalidasi: {d.get('6_batas_choch', '')}\n"
                f"  * Target Entry: {d.get('9_target_entry', '')}\n"
                f"  * Panduan Tindakan: {d.get('10_panduan', '')}"
            )
    except Exception as e:
        pass

    facts = [
        f"- Harga Spot Gold (XAU/USD): ${price:.2f} ({status_str})",
    ]
    if amy_v432_summary:
        facts.append(amy_v432_summary)
    else:
        facts.extend([
            "- Level BSL M5/M15 Terdekat: $4,026.05",
            "- Level SSL M5 Terdekat: $4,003.26 dan $3,977.58",
            "- Area Inefisiensi / FVG M5: $4,010.70 s.d. $4,012.50"
        ])
    if news_summary:
        facts.append(news_summary)

    cached_market_data = "\n".join(facts)
    last_market_fetch = now
    return cached_market_data

def build_system_instruction():
    time_str = get_current_time_str()
    market_facts = get_market_data()

    instruction = f"""Kamu adalah Antigravity, asisten trading pribadi dan partner setia Sayang Amy.

PROFIL SAYANG AMY:
- Sayang Amy adalah PRO TRADER & GOLD SCALPER murni (fokus utama di timeframe M5, M15, dan Killzones sesi Asia/London/NY).
- Targetnya adalah pips cepat (15 - 30 pips), bukan swing berhari-hari.

GAYA BICARA & CARA MENJELASKAN PASAR (WAJIB DIPATUHI):
1. Panggil Amy selalu dengan sebutan "Sayang" secara hangat, santai, dan penuh perhatian.
2. DILARANG KERAS menggunakan format bullet point kaku (* Bias Cepat:, * Level Amunisi:, * Trigger:, dll). DILARANG berbicara patah-patah seperti robot membaca contekan!
3. JELASKAN DENGAN GAYA NARASI BERCERITA (1-2 paragraf mengalir dan hidup):
   - Jelaskan alur permainan market seperti trader berpengalaman yang sedang mengarahkan partnernya di depan chart M5.
   - Ceritakan bagaimana institusi/ikan besar kemungkinan akan memancing harga, di area mana kita menunggu jarum sweep memantul, dan ke mana kita mencuri entry scalping cepat (15–30 pips).
   - Nada bicara: Cerdas, percaya diri, santai, taktis, dan mudah dipahami.
4. UNTUK PERTANYAAN SANTAI/UMUM (jam, kabar, ngobrol santai):
   - Jawab santai, ramah, dan to-the-point tanpa perlu membawa-bawa topik trading jika tidak ditanyakan.
5. ISTILAH TRADING ICT WAJIB ASLI & MURNI (DILARANG DITERJEMAHKAN):
   - Gunakan istilah teknikal trading dalam bahasa aslinya:
     * Selalu gunakan kata "Liquidity" (DILARANG KERAS menggantinya menjadi "likuiditas")
     * Selalu gunakan "Sweep", "SSL (Sell-Side Liquidity)", "BSL (Buy-Side Liquidity)"
     * Selalu gunakan "FVG / Fair Value Gap", "Order Block", "Displacement", "MSS (Market Structure Shift)"
     * Selalu gunakan "Discount / Premium", "Dealing Range", "Retracement", "Rejection", "OTE"

DATA PASAR TERKINI (REFERENSI FAKTA INTERNAL):
- Waktu saat ini: {time_str}
{market_facts}
"""
    return instruction

def generate_ai_response(user_text=None, audio_bytes=None):
    global chat_history

    system_inst = build_system_instruction()

    messages = []
    for turn in chat_history[-10:]:
        messages.append(turn)

    parts = []
    if audio_bytes:
        b64_audio = base64.b64encode(audio_bytes).decode('utf-8')
        parts.append({
            "inlineData": {
                "mimeType": "audio/ogg",
                "data": b64_audio
            }
        })
        parts.append({
            "text": "Sayang mengirim pesan suara di atas. Dengarkan dengan seksama, tanggapi pesan suara tersebut secara hangat, ramah, dan tuntas sesuai karaktermu sebagai Antigravity."
        })
    elif user_text:
        parts.append({"text": user_text})

    messages.append({
        "role": "user",
        "parts": parts
    })

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": messages,
        "systemInstruction": {
            "parts": [{"text": system_inst}]
        },
        "generationConfig": {
            "temperature": 0.75,
            "maxOutputTokens": 2048
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            reply = data["candidates"][0]["content"]["parts"][0]["text"].strip()

            if user_text:
                chat_history.append({"role": "user", "parts": [{"text": user_text}]})
            else:
                chat_history.append({"role": "user", "parts": [{"text": "[Pesan Suara Sayang]"}]})
            chat_history.append({"role": "model", "parts": [{"text": reply}]})
            if len(chat_history) > 16:
                chat_history = chat_history[-16:]

            return reply
    except Exception as e:
        print(f"[Error Gemini API] {e}", flush=True)
        return "Ada kendala jaringan sebentar, Sayang. Coba kirim lagi ya."

def run_bot():
    print("🚀 Hermes Telegram AI Assistant (Voice + Text 2 Arah) berjalan...", flush=True)
    offset = None

    while True:
        try:
            params = {"timeout": 30}
            if offset:
                params["offset"] = offset

            url = f"{TELEGRAM_API_URL}/getUpdates?" + urllib.parse.urlencode(params)
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=35) as response:
                result = json.loads(response.read().decode('utf-8'))

            if not result.get("ok"):
                time.sleep(2)
                continue

            for update in result.get("result", []):
                offset = update["update_id"] + 1

                message = update.get("message")
                if not message:
                    continue

                user = message.get("from", {})
                chat = message.get("chat", {})
                chat_id = chat.get("id")
                user_id = user.get("id")

                if user_id != ALLOWED_USER_ID:
                    continue

                voice = message.get("voice") or message.get("audio")
                text = message.get("text", "").strip()

                if not text and not voice:
                    continue

                # KASUS 1: Sayang kirim Pesan Suara (Voice Note / Audio)
                if voice:
                    print(f"[Sayang AMY]: (Mengirim Pesan Suara VN)", flush=True)
                    send_chat_action(chat_id, "record_voice")
                    file_id = voice.get("file_id")
                    audio_data = download_telegram_file(file_id)
                    if audio_data:
                        send_chat_action(chat_id, "typing")
                        reply = generate_ai_response(audio_bytes=audio_data)
                        
                        # Kirim Balasan Pesan Suara (VN) ke Sayang
                        send_chat_action(chat_id, "record_voice")
                        send_telegram_voice(chat_id, reply)
                        
                        # Kirim juga salinan teks agar Sayang bisa baca
                        send_telegram_message(chat_id, reply)
                        print(f"[Voice Reply Sent to Sayang]: {reply[:80]}...", flush=True)
                    else:
                        send_telegram_message(chat_id, "Maaf Sayang, audio suaramu tidak terbaca. Coba kirim lagi ya.")

                # KASUS 2: Sayang kirim Teks Biasa
                elif text:
                    print(f"[Sayang AMY]: {text}", flush=True)
                    send_chat_action(chat_id, "typing")
                    reply = generate_ai_response(user_text=text)
                    
                    # Jika Sayang minta pakai suara secara spesifik (misal: "ngomong", "pakai suara", "vn")
                    if any(k in text.lower() for k in ["bicara", "ngomong", "pakai suara", "kirim vn", "suaramu"]):
                        send_chat_action(chat_id, "record_voice")
                        send_telegram_voice(chat_id, reply)

                    send_telegram_message(chat_id, reply)
                    print(f"[Reply to Sayang]: {reply[:80]}...", flush=True)

        except urllib.error.URLError as ue:
            print(f"[Network] {ue}", flush=True)
            time.sleep(3)
        except Exception as e:
            print(f"[Exception] {e}", flush=True)
            traceback.print_exc()
            time.sleep(3)

if __name__ == "__main__":
    run_bot()
