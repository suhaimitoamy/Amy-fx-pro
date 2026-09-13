"""Build 60 pedagogical OHLC scenarios. Prices are illustrative, never market history."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'app/src/main/assets/apps/academy'
FVG = 'bagian-17-fvg-masterclass/'
lessons = {
 'fvg': (FVG+'fair-value-gap-fvg-celah-imbalance.html', 'Fair Value Gap (FVG)'),
 'liquidity': (FVG+'equal-highs-dan-equal-lows.html', 'Equal highs, equal lows dan liquidity'),
 'structure': ('bagian-02-membaca-chart/market-structure-dasar.html', 'Market structure dasar'),
 'range': ('bagian-05-smart-money-concept/premium-dan-discount.html', 'Premium, discount dan dealing range'),
 'risk': ('bagian-10-xauusd/cara-menentukan-sltp-gold.html', 'Menentukan SL dan TP Gold'),
}
# Resolve the actual existing chapter name; links always point to a lesson, not a search page.
lessons['risk'] = (next(BASE.glob('bagian-10*/cara-menentukan-sltp-gold.html')).relative_to(BASE).as_posix(), lessons['risk'][1])
exercises=[]
def add(kind, side, rows, marks, levels, questions, evidence):
    for j,(prompt,answer,wrong,reason) in enumerate(questions):
        n=len(exercises)
        # Translation preserves every OHLC/pattern relationship; each question owns its chart.
        shift=(n//6)*20
        candles=[dict(time=1704067200+n*86400+i*900,open=o+shift,high=h+shift,low=l+shift,close=c+shift) for i,(o,h,l,c) in enumerate(rows)]
        price=lambda x: f'{x+shift:.2f}'
        def fmt(s):
            import re
            return re.sub(r'\{(\d+(?:\.\d+)?)\}',lambda m:price(float(m[1])),s)
        path,title=lessons[kind]
        assert (BASE/path).is_file(),path
        exercises.append(dict(id=f'{kind}-{side}-{j+1}',category=title,topic=kind,difficulty=['mudah','mudah','sedang','sedang','advanced','advanced'][j],title=f'{title} · studi {n+1}',type='choice',timeframe='M15',source='illustrative-ohlc-v2',prompt=fmt(prompt),answer=fmt(answer),choices=[fmt(answer)]+[fmt(w) for w in wrong],principle=fmt(reason),lesson={'href':'../'+path,'title':title},candles=candles,markers=[{'time':candles[i]['time'],'position':'aboveBar','color':'#60a5fa','shape':'circle','text':t} for i,t in marks],levels=[{'price':p+shift,'title':t,'color':'#94a3b8'} for p,t in levels],evidence=evidence,chartGuide='Candle A/B/C dan garis acuan adalah bagian dari soal. Geser atau perbesar chart; sentuh candle untuk melihat OHLC.'))
for bullish in [True,False]:
    side='bullish' if bullish else 'bearish'
    rows=[(100,103,99,102),(102,104,100,101),(101,103,100,102),(102,104,101,103),(103,113,102,112),(112,115,109,114)]
    if not bullish: rows=[(220-o,220-l,220-h,220-c) for o,h,l,c in rows]
    lo,hi=(104,109) if bullish else (111,116)
    a,b,c=rows[-3:]
    q=[
      ('Amati candle A–B–C. Jenis imbalance yang terbentuk?',f'FVG {side}',[f'FVG {"bearish" if bullish else "bullish"}','Tidak ada FVG'],'FVG tiga candle memakai wick A dan C yang tidak overlap, dengan displacement pada B.'),
      ('Candle mana yang menjadi dorongan tengah pembentuk FVG?','B',['A','C'],'B berada di tengah dan memiliki body besar; gap dibuktikan oleh wick A dan C.'),
      ('Berapa batas bawah dan atas FVG A–C?',f'{{{lo}}} – {{{hi}}}',[f'{{{lo-3}}} – {{{lo}}}',f'{{{hi}}} – {{{hi+4}}}'],f'Batas gap adalah high A dan low C untuk bullish, low A dan high C untuk bearish. Di sini: {{{lo}}}–{{{hi}}}.'),
      ('Di harga mana midpoint / consequent encroachment FVG?',f'{{{(lo+hi)/2}}}',[f'{{{lo}}}',f'{{{hi}}}'],'CE = (batas bawah + batas atas) / 2. CE bukan jaminan harga akan bereaksi.'),
      ('Chart berakhir di C. Apakah entry retest FVG sudah terjadi?','Belum ada candle retest setelah C',['Sudah, karena B besar','Sudah, karena FVG terbentuk'],'Formasi FVG dan retest adalah dua peristiwa berbeda. Chart belum memuat candle setelah pembentukan.'),
      ('Apa yang dapat disimpulkan dari chart ini saja?','FVG terbentuk; bias HTF dan validasi entry belum tersedia',['Pasti profit jika entry di CE','Bias semua timeframe sudah sama'],'Chart membuktikan geometri FVG saja. Bias HTF, risiko dan konfirmasi entry harus dinilai terpisah.')]
    add('fvg',side,rows,[(3,'A'),(4,'B'),(5,'C')],[(lo,'Batas bawah zona'),(hi,'Batas atas zona')],q,{'pattern':'fvg','direction':side,'a':3,'b':4,'c':5})
for high in [True,False]:
    side='BSL' if high else 'SSL'
    rows=[(100,103,99,102),(102,110,101,106),(106,107,102,103),(103,110,102,106),(106,107,103,104),(104,113,103,107)]
    if not high: rows=[(220-o,220-l,220-h,220-c) for o,h,l,c in rows]
    close=107 if high else 113
    q=[
     ('Dua wick A dan B berada di level yang sama. Pool yang ditunjukkan?', 'Buy-side liquidity di atas equal highs' if high else 'Sell-side liquidity di bawah equal lows',['FVG tiga candle','Tidak ada level yang berulang'],'Equal highs/lows adalah acuan potensi kumpulan stop, bukan pengamatan langsung seluruh order pasar.'),
     ('Candle mana yang menembus level A/B kemudian close kembali?','C',['A','B'],'C melewati level referensi dengan wick lalu close kembali di sisi sebelumnya.'),
     ('Berapa harga level acuan A/B?','{110}',['{103}','{113}'],'Bandingkan kedua wick A dan B: keduanya tepat di level acuan yang ditandai.'),
     ('Mengapa C dibaca sebagai sweep/reclaim, bukan close breakout?','Wick melewati level dan close kembali',['Warna candle saja cukup','Setiap high/low baru adalah breakout'],f'C menembus {{110}}, tetapi close di {{{close}}}. Posisi close terhadap level membedakan reclaim dari close-through.'),
     ('Apakah sweep C sendirian memastikan pembalikan tren?','Tidak; tunggu konfirmasi struktur dan konteks',['Ya, pasti reversal','Ya, selalu entry tanpa SL'],'Sweep adalah kejadian harga. Konfirmasi sesudahnya belum terlihat di chart.'),
     ('Bukti mana yang belum tersedia sampai candle C?','MSS lanjutan setelah sweep',['Dua wick pada level sama','Wick melewati level acuan'],'Tidak ada candle setelah C. Jangan mengasumsikan MSS atau hasil trade yang belum terjadi.')]
    add('liquidity',side,rows,[(1,'A'),(3,'B'),(5,'C')],[(110,'Level A/B')],q,{'pattern':'sweep','direction':'high' if high else 'low','a':1,'b':3,'c':5})
for bull in [True,False]:
    side='break naik' if bull else 'break turun'
    rows=[(100,104,99,103),(103,110,102,108),(108,109,102,104),(104,106,101,103),(103,112,102,109),(109,117,108,116)]
    if not bull: rows=[(220-o,220-l,220-h,220-c) for o,h,l,c in rows]
    q=[
     ('Candle C close di sisi mana dari level swing A?','Di atas swing A' if bull else 'Di bawah swing A',['Tepat di swing A','Belum menyentuh swing A'],'Baca close C terhadap garis swing A, bukan hanya wick tertinggi/terendah.'),
     ('Candle mana hanya menembus dengan wick tanpa close melewati swing?','B',['A','C'],'B menembus swing tetapi close kembali; C baru close melewati level.'),
     ('Level struktur yang dilampaui close C adalah?','{110}',['{101}','{117}'],'Level {110} berasal dari wick swing A yang terbentuk sebelum breakout.'),
     ('Manakah bukti lebih kuat untuk close-break pada chart ini?','Close C melewati swing A',['Wick B saja','Warna A saja'],'Break berbasis close harus dibuktikan oleh penutupan melewati swing yang sudah ada.'),
     ('Dapatkah satu window ini memastikan label BOS continuation atau MSS reversal?','Perlu konteks tren sebelum window',['Pasti BOS continuation','Pasti MSS reversal'],'Arah break terlihat, tetapi BOS continuation versus MSS reversal memerlukan struktur/tren sebelumnya.'),
     ('Apakah retest level yang ditembus sudah terkonfirmasi?','Belum; chart berhenti pada candle break C',['Sudah karena wick B','Sudah karena C besar'],'Retest harus terjadi sesudah break; tidak boleh memakai candle B sebelum break C sebagai retest.')]
    add('structure',side,rows,[(1,'A'),(4,'B'),(5,'C')],[(110,'Swing A')],q,{'pattern':'break','direction':'up' if bull else 'down','a':1,'b':4,'c':5})
for premium in [False,True]:
    side='premium' if premium else 'discount'
    last=115 if premium else 105
    rows=[(104,108,100,106),(106,115,105,113),(113,120,110,115),(115,116,104,106),(106,116 if premium else 108,103,last)]
    q=[
     ('Close C berada di bagian mana dari dealing range A–B?',side.capitalize(),['Equilibrium',('Discount' if premium else 'Premium')],'Premium di atas midpoint; discount di bawah midpoint dari range yang dinyatakan dalam soal.'),
     ('Berapa equilibrium range {100}–{120}?','{110}',['{100}','{120}'],'Equilibrium = (range high + range low) / 2.'),
     ('Berapa posisi relatif close C dari batas bawah range?', '75%' if premium else '25%',['50%','100%'],f'Posisi = (close − low) / (high − low). Close {{{last}}}, low {{100}}, high {{120}}.'),
     ('Level mana yang merupakan batas external atas range?','{120}',['{110}','{105}'],'External atas adalah high pembentuk range B; midpoint adalah level internal.'),
     ('Apakah lokasi close C cukup untuk langsung entry?','Tidak; lokasi harus dipadukan konteks dan konfirmasi',['Ya, lokasi menjamin arah','Ya, tanpa perlu risiko'],'Premium/discount adalah lokasi relatif terhadap range terpilih, bukan sinyal mandiri.'),
     ('Jika memakai range timeframe lebih tinggi, apa yang harus dilakukan?','Hitung ulang posisi dengan high/low range HTF',['Pertahankan persentase yang sama','Anggap seluruh timeframe identik'],'Persentase lokasi bergantung pada pasangan batas range. Chart ini hanya menunjukkan range yang ditetapkan.')]
    add('range',side,rows,[(0,'A'),(2,'B'),(4,'C')],[(100,'Range low'),(110,'Equilibrium'),(120,'Range high')],q,{'pattern':'range','closeIndex':4,'position':0.75 if premium else 0.25})
for buy in [True,False]:
    side='BUY' if buy else 'SELL'
    entry,stop,target=(110,105,120) if buy else (110,115,100)
    rows=[(108,112,107,111),(111,114,108,112),(112,113,107,109),(109,112,108,110)]
    q=[
     (f'Rencana {side}: garis Entry, SL, TP terlihat. Berapa jarak risiko entry–SL?','5 poin',['10 poin','15 poin'],'Risiko harga = nilai absolut entry − SL. Nilai uang per poin belum diberikan.'),
     (f'Rencana {side}: berapa jarak reward entry–TP?','10 poin',['5 poin','20 poin'],'Reward harga = nilai absolut TP − entry.'),
     ('Berapa reward:risk rencana pada chart?','2:1',['1:2','1:1'],'Reward 10 poin dibagi risiko 5 poin = 2R, belum memperhitungkan biaya.'),
     (f'Untuk {side}, apakah posisi SL dan TP terhadap entry valid secara geometri?','Ya, SL di sisi rugi dan TP di sisi untung',['Tidak, SL dan TP terbalik','Tidak, karena entry harus sama dengan SL'],'BUY: SL < entry < TP. SELL: TP < entry < SL. Validasi geometri tidak membuktikan kualitas sinyal.'),
     ('Chart berhenti di C sebelum trade berjalan. Apakah TP/SL sudah boleh dicatat?','Belum, perlu candle setelah entry',['Catat TP karena 2R','Catat SL karena wick sebelumnya'],'Candle sebelum/saat keputusan bukan hasil trade ke depan. Jangan mengisi outcome tanpa data lanjutan.'),
     ('Jika biaya round-trip setara 1 poin, reward bersih pada TP berapa?','9 poin',['10 poin','11 poin'],'Reward kotor 10 poin − biaya 1 poin = 9 poin. RR kotor bukan hasil bersih setelah biaya.')]
    add('risk',side,rows,[(3,'C')],[(entry,'Entry'),(stop,'SL'),(target,'TP')],q,{'pattern':'risk','side':side})
assert len(exercises)==60
(BASE/'trading-practice/assets/data/guided-exercises.json').write_text(json.dumps({'schemaVersion':2,'source':'Skenario OHLC ilustratif untuk belajar; bukan harga pasar atau hasil backtest.','exercises':exercises},ensure_ascii=False,indent=2)+'\n')
