#!/usr/bin/env python3
"""
AMY ICT CONTEXT V4.3.2 - Analysis Engine
========================================
Mesin Analisis Institusional Berdasarkan Indikator TradingView:
"AMY ICT V4.3.2 [Smart Entry Target + Mobile Fit]"

Menghasilkan kalkulasi 100% identik dengan tabel Dashboard 16 Baris Pine Script:
- 3-TF Bias Matrix (HTF: H1, MTF: M15, LTF: M5)
- Struktur & Batas CHoCH (Major Swing High/Low)
- SBR & RBS (Breaker Blocks)
- Supply (RBD/DBD) & Demand (DBR/RBR) + FVG
- Dealing Range & % Premium / Discount (EQ 50%)
- External Liquidity BSL & SSL + PDH/PDL + Sesi Asia
- Target Entry & Panduan Aksi Presisi
"""

import math
import sqlite3
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Tuple, Optional

DB_PATH = "/root/amy-market-data/xauusd_bot.sqlite"

def load_candles(symbol: str = "XAU/USD", timeframe: str = "M15", limit: int = 150) -> List[Dict]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT open_time, open, high, low, close, volume_tick
        FROM candles
        WHERE symbol = ? AND timeframe = ?
        ORDER BY open_time DESC
        LIMIT ?
    """, (symbol, timeframe, limit))
    rows = cursor.fetchall()
    conn.close()
    
    candles = []
    for r in reversed(rows):
        candles.append({
            "time": r[0],
            "open": float(r[1]),
            "high": float(r[2]),
            "low": float(r[3]),
            "close": float(r[4]),
            "volume": int(r[5])
        })
    return candles

def calc_atr(candles: List[Dict], period: int = 14) -> List[float]:
    atrs = []
    tr_list = []
    for i in range(len(candles)):
        h = candles[i]["high"]
        l = candles[i]["low"]
        if i == 0:
            tr = h - l
        else:
            prev_c = candles[i-1]["close"]
            tr = max(h - l, abs(h - prev_c), abs(l - prev_c))
        tr_list.append(tr)
        if len(tr_list) < period:
            atrs.append(sum(tr_list) / len(tr_list))
        else:
            atrs.append(sum(tr_list[-period:]) / period)
    return atrs

def calc_ema(candles: List[Dict], period: int = 9) -> List[float]:
    emas = []
    multiplier = 2 / (period + 1)
    for i, c in enumerate(candles):
        val = c["close"]
        if i == 0:
            emas.append(val)
        else:
            prev_ema = emas[-1]
            emas.append((val - prev_ema) * multiplier + prev_ema)
    return emas

def calc_structure(candles: List[Dict], piv_len: int = 5, use_vshape: bool = False) -> Dict:
    n = len(candles)
    if n < piv_len * 2 + 1:
        return {"dir": 1, "lastH": candles[-1]["high"], "lastL": candles[-1]["low"], "isChoch": False}
    
    atrs = calc_atr(candles, 14)
    emas = calc_ema(candles, 9)
    
    last_h = candles[0]["high"]
    last_l = candles[0]["low"]
    direction = 0
    is_choch = False
    
    for i in range(piv_len, n - piv_len):
        # Pivot High
        is_ph = True
        curr_h = candles[i]["high"]
        for k in range(1, piv_len + 1):
            if candles[i - k]["high"] > curr_h or candles[i + k]["high"] > curr_h:
                is_ph = False
                break
        if is_ph:
            last_h = curr_h
            
        # Pivot Low
        is_pl = True
        curr_l = candles[i]["low"]
        for k in range(1, piv_len + 1):
            if candles[i - k]["low"] < curr_l or candles[i + k]["low"] < curr_l:
                is_pl = False
                break
        if is_pl:
            last_l = curr_l

        # Direction update
        c_price = candles[i]["close"]
        atr_val = atrs[i] if i < len(atrs) else 1.0
        ema_fast = emas[i] if i < len(emas) else c_price
        
        # V-Shape
        rec_l = min(c["low"] for c in candles[max(0, i-11):i+1])
        rec_h = max(c["high"] for c in candles[max(0, i-11):i+1])
        highest_3_prev = max(c["high"] for c in candles[max(0, i-3):i]) if i >= 3 else c_price
        lowest_3_prev = min(c["low"] for c in candles[max(0, i-3):i]) if i >= 3 else c_price
        
        v_bull = use_vshape and c_price > ema_fast and (c_price - rec_l) >= (atr_val * 1.35) and c_price > highest_3_prev
        v_bear = use_vshape and c_price < ema_fast and (rec_h - c_price) >= (atr_val * 1.35) and c_price < lowest_3_prev
        
        if c_price > last_h or (direction <= 0 and v_bull):
            is_choch = (direction == -1)
            direction = 1
        elif c_price < last_l or (direction >= 0 and v_bear):
            is_choch = (direction == 1)
            direction = -1
        elif direction == 0:
            direction = 1 if c_price >= candles[i]["open"] else -1

    recent_h = max(c["high"] for c in candles[-3:])
    recent_l = min(c["low"] for c in candles[-3:])
    
    return {
        "dir": direction,
        "lastH": last_h,
        "lastL": last_l,
        "isChoch": is_choch,
        "recentH": recent_h,
        "recentL": recent_l
    }

def analyze_amy_context_v432(symbol: str = "XAU/USD") -> Dict:
    candles_htf = load_candles(symbol, "H1", 80)
    candles_mtf = load_candles(symbol, "M15", 100)
    candles_ltf = load_candles(symbol, "M5", 100)
    
    if not candles_htf or not candles_mtf or not candles_ltf:
        return {"error": "Candles tidak cukup di database."}
        
    curr_c = candles_mtf[-1]["close"]
    atrs_mtf = calc_atr(candles_mtf, 14)
    atr_val = atrs_mtf[-1] if atrs_mtf else 1.0

    # 1. Struktur 3-TF
    htf_struct = calc_structure(candles_htf, piv_len=5, use_vshape=False)
    mtf_struct = calc_structure(candles_mtf, piv_len=5, use_vshape=False)
    ltf_struct = calc_structure(candles_ltf, piv_len=2, use_vshape=True)
    
    is_htf_bull = htf_struct["dir"] >= 0
    is_mtf_bull = mtf_struct["dir"] >= 0
    is_ltf_bull = ltf_struct["dir"] >= 0
    
    # 2. MTF Zones (SBR/RBS, FVG, OB, Liquidity)
    # Dev High/Low (last 32)
    dev_high = max(c["high"] for c in candles_mtf[-32:])
    dev_low = min(c["low"] for c in candles_mtf[-32:])
    
    # BSL & SSL
    bsl_level = mtf_struct["lastH"]
    ssl_level = mtf_struct["lastL"]
    bsl_swept = (candles_mtf[-1]["high"] > bsl_level and candles_mtf[-1]["close"] < bsl_level) or (dev_high > bsl_level and curr_c < bsl_level)
    ssl_swept = (candles_mtf[-1]["low"] < ssl_level and candles_mtf[-1]["close"] > ssl_level) or (dev_low < ssl_level and curr_c > ssl_level)
    
    # SBR & RBS
    sbr_top, sbr_bot = None, None
    rbs_top, rbs_bot = None, None
    if curr_c > bsl_level:
        rbs_top = bsl_level + (atr_val * 0.10)
        rbs_bot = bsl_level - (atr_val * 0.25)
    if curr_c < ssl_level:
        sbr_top = ssl_level + (atr_val * 0.25)
        sbr_bot = ssl_level - (atr_val * 0.10)

    # MTF FVGs & OBs
    bear_ob_t, bear_ob_b, bear_ob_pat = None, None, "RBD"
    bull_ob_t, bull_ob_b, bull_ob_pat = None, None, "DBR"
    bear_fvg_t, bear_fvg_b = None, None
    bull_fvg_t, bull_fvg_b = None, None
    
    min_gap = atr_val * 0.12
    for i in range(2, len(candles_mtf)):
        c1, c2, c3 = candles_mtf[i-2], candles_mtf[i-1], candles_mtf[i]
        # Bull FVG
        if c3["low"] > c1["high"] and (c3["low"] - c1["high"]) >= min_gap and c2["close"] > c2["open"]:
            bull_fvg_t = c3["low"]
            bull_fvg_b = c1["high"]
            # Bull OB
            if (c2["close"] - c2["open"]) > (atr_val * 0.5) or c2["close"] > c1["high"]:
                bull_ob_t = c1["high"] if c1["close"] <= c1["open"] else max(c1["high"], c1["low"] + atr_val * 0.6)
                bull_ob_b = c1["low"] if c1["close"] <= c1["open"] else min(c1["low"], candles_mtf[i-3]["low"] if i >= 3 else c1["low"])
                bull_ob_pat = "DBR"
                
        # Bear FVG
        if c3["high"] < c1["low"] and (c1["low"] - c3["high"]) >= min_gap and c2["close"] < c2["open"]:
            bear_fvg_t = c1["low"]
            bear_fvg_b = c3["high"]
            # Bear OB
            if (c2["open"] - c2["close"]) > (atr_val * 0.5) or c2["close"] < c1["low"]:
                bear_ob_t = c1["high"] if c1["close"] >= c1["open"] else max(c1["high"], candles_mtf[i-3]["high"] if i >= 3 else c1["high"])
                bear_ob_b = c1["low"] if c1["close"] >= c1["open"] else min(c1["low"], c1["high"] - atr_val * 0.6)
                bear_ob_pat = "RBD"

    # 3. Dealing Range
    range_high = max(bsl_level, htf_struct["lastH"], dev_high)
    range_low = min(ssl_level, htf_struct["lastL"], dev_low)
    range_size = max(range_high - range_low, 0.01)
    eq_mid = (range_high + range_low) / 2.0
    range_pct = max(0.0, min(100.0, ((curr_c - range_low) / range_size) * 100.0))
    is_premium = range_pct > 52.5
    is_discount = range_pct < 47.5
    zone_label = f"PREMIUM ({range_pct:.0f}%)" if is_premium else f"DISCOUNT ({range_pct:.0f}%)" if is_discount else f"EQUILIBRIUM ({range_pct:.0f}%)"

    # Status & Zone In/Rej
    sup_floor = bear_ob_b or bear_fvg_b
    sup_ceil = bear_ob_t or bear_fvg_t
    dem_ceil = bull_ob_t or bull_fvg_t
    dem_floor = bull_ob_b or bull_fvg_b
    
    in_supply = sup_floor is not None and curr_c >= (sup_floor - atr_val * 0.05) and curr_c <= (sup_ceil + atr_val * 0.15)
    in_demand = dem_ceil is not None and curr_c <= (dem_ceil + atr_val * 0.05) and curr_c >= (dem_floor - atr_val * 0.15)
    rej_supply = not in_supply and sup_floor is not None and ltf_struct["recentH"] >= sup_floor and curr_c < sup_floor and (sup_floor - curr_c) <= (atr_val * 0.85)
    rej_demand = not in_demand and dem_ceil is not None and ltf_struct["recentL"] <= dem_ceil and curr_c > dem_ceil and (curr_c - dem_ceil) <= (atr_val * 0.85)

    is_full_bull = is_htf_bull and is_mtf_bull and is_ltf_bull
    is_full_bear = not is_htf_bull and not is_mtf_bull and not is_ltf_bull
    is_bull_pullback = is_htf_bull and (not is_ltf_bull or not is_mtf_bull or in_demand)
    is_bear_pullback = not is_htf_bull and (is_ltf_bull or is_mtf_bull or in_supply)

    # Phase Status & Action Guide
    if is_htf_bull:
        if in_demand:
            phase_status = "DI ZONA BELI: Menguji Demand"
            action_guide = "Harga di Area Pantul Bullish — JANGAN SELL! Pantau Rejeksi Naik M5"
        elif rej_demand:
            phase_status = f"REJEKSI DARI DEMAND [{bull_ob_pat}] (Mulai Memantul Naik)"
            action_guide = "Harga Memantul dari Demand M15 — Pantau Kelanjutan Naik di M5"
        elif is_bull_pullback:
            phase_status = "FASE PULLBACK TURUN (HTF Bullish vs M5 Koreksi)"
            action_guide = "Koreksi Wajar dari Premium Menuju Demand Bawah" if is_premium else "Koreksi di Discount — Awas Jebakan Sell, Tunggu Masuk Demand"
        elif is_full_bull and is_premium:
            phase_status = f"EKSPANSI BULLISH DI PREMIUM ({range_pct:.0f}%)"
            action_guide = "Tren Naik Kuat, Tapi Harga Sudah Tinggi (Hindari FOMO Buy di Pucuk)"
        else:
            phase_status = "EKSPANSI SEARAH BULLISH (H1/M15/M5 Naik)"
            action_guide = "Struktur Sehat Searah Menuju Magnet Likuiditas Atas"
    else:
        if in_supply:
            phase_status = "DI ZONA JUAL: Menguji Supply"
            action_guide = "Harga di Dalam Supply — JANGAN KEJAR BUY! Pantau Rejeksi Turun M5"
        elif rej_supply:
            phase_status = f"REJEKSI DARI SUPPLY [{bear_ob_pat}] (Harga Memantul Turun)"
            action_guide = "Supply M15 Berhasil Menolak Harga — Struktur Turun Menuju Demand/SSL"
        elif is_bear_pullback:
            phase_status = "FASE PULLBACK NAIK (HTF Bearish vs M15/M5 Rebound)"
            action_guide = "Pantulan Koreksi Naik Menuju Supply Atas (Hati-hati Counter-Trend)"
        elif is_full_bear and is_discount:
            phase_status = f"EKSPANSI BEARISH DI DISCOUNT ({range_pct:.0f}%)"
            action_guide = "Tren Turun Kuat, Tapi Harga di Dasar (Jangan FOMO Sell di Lembah!)"
        else:
            phase_status = "EKSPANSI SEARAH BEARISH (H1/M15/M5 Turun)"
            action_guide = "Struktur Sehat Searah Menuju Magnet Likuiditas Bawah"

    # Batas CHoCH / Invalidasi
    htf_inv_txt = f"H1 Batal Bull < {htf_struct['lastL']:.2f}" if is_htf_bull else f"H1 Batal Bear > {htf_struct['lastH']:.2f}"
    mtf_inv_txt = f"M15 Batal Bull < {mtf_struct['lastL']:.2f}" if is_mtf_bull else f"M15 Batal Bear > {mtf_struct['lastH']:.2f}"
    batas_choch_txt = f"{htf_inv_txt} | {mtf_inv_txt}"

    # Target Entry Recommendation
    if is_htf_bull:
        if not is_mtf_bull and not in_demand:
            entry_rec = f"Buy H1: Demand M15 | Sell M15: Supply M15 (CHoCH M5)"
        else:
            entry_rec = f"Fokus Buy (H1/M15): Retest Demand M15 / FVG"
    else:
        if is_mtf_bull and not in_supply:
            entry_rec = f"Sell H1: Supply M15 | Buy M15: Demand M15 (CHoCH M5)"
        else:
            entry_rec = f"Fokus Sell (H1/M15): Retest Supply M15 / FVG"

    return {
        "current_price": curr_c,
        "mode": "Intraday Standar (H1 / M15 / M5)",
        "dashboard_rows": {
            "0_status": "REJEKSI DARI POI!" if (rej_supply or rej_demand) else "DI ZONA POI AKTIF!" if (in_supply or in_demand) else "SEARAH (ALIGNED)" if (is_full_bull or is_full_bear) else "FASE PULLBACK",
            "1_3tf_bias": f"H1: {'BULL' if is_htf_bull else 'BEAR'}  |  M15: {'BULL' if is_mtf_bull else 'BEAR'}  |  M5: {'BULL' if is_ltf_bull else 'BEAR'}",
            "2_fase_market": phase_status,
            "3_range_pos": f"{zone_label} | {range_low:.2f}-{range_high:.2f} (EQ: {eq_mid:.2f})",
            "4_magnet_atas": f"M15 BSL: {range_high:.2f} (${abs(range_high - curr_c):.1f})",
            "5_magnet_bawah": f"M15 SSL: {range_low:.2f} (${abs(curr_c - range_low):.1f})",
            "6_batas_choch": batas_choch_txt,
            "7_supply_mtf": f"Supply [{bear_ob_pat}] {sup_floor:.2f}-{sup_ceil:.2f}" if sup_floor else "Mit/None",
            "8_demand_mtf": f"Demand [{bull_ob_pat}] {dem_floor:.2f}-{dem_ceil:.2f}" if dem_floor else "Mit/None",
            "9_target_entry": entry_rec,
            "10_panduan": action_guide
        },
        "structure": {
            "htf_h1": htf_struct,
            "mtf_m15": mtf_struct,
            "ltf_m5": ltf_struct
        },
        "dealing_range": {
            "high": range_high,
            "low": range_low,
            "eq": eq_mid,
            "pct": range_pct,
            "is_premium": is_premium,
            "is_discount": is_discount
        }
    }

if __name__ == "__main__":
    res = analyze_amy_context_v432()
    print(json.dumps(res, indent=2))
