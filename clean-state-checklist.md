# Amy FX Pro — Clean State Checklist

Setiap sebelum sesi berakhir atau sebelum commit rilis baru:
- [x] `./init.sh` berjalan sukses tanpa error (sintaks 0 error, baseline test pass).
- [x] Paritas Card Gold Beranda vs Mapping tetap identik 100% (Glassmorphism 340px).
- [x] Port server lokal tetap 8080 di `tools/serve-local.mjs`.
- [x] Tidak ada modifikasi ke Supabase yang sudah dibekukan (*Zero-Touch Supabase*).
- [x] Format angka di Amy Live Voice tetap menggunakan digit numerik riil ($3595.57, bukan kata-kata panjang).
- [x] `feature_list.json` dan `session-handoff.md` terupdate mencerminkan status terbaru.
- [x] `git status` bersih, tidak ada file temporary liar tertinggal.
