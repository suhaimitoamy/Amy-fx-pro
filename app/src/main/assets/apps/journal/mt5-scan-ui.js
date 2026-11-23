(function () {
  "use strict";

  var MAX_FILES = 5;
  var MAX_IMAGE_WIDTH = 1280;
  var JPEG_QUALITY = 0.84;
  var ENCODED_FALLBACK_KEYS = [
    "QVEuQWI4Uk42TEx4QWtUM2E2cHNmQkJJNVI0TmNtMDVySVdRcy01WGo5R3ROM1B2TW52V1E=",
    "QVEuQWI4Uk42SzVONm5tNmNQclJqLXdFNG5Hc0plMWh2UzN3R0loV2tNdFVPeE1DNURaY3c=",
    "QVEuQWI4Uk42SnVYMGI5elFMQzRzRjk2alBRYnh4MVNrY2VvSG9rZHlQeW5zY2pFUGxpWFE=",
    "QVEuQWI4Uk42SW5Kck5KNTE1WFZzaTYzXzBoeWtnZ3YyMUtPSWNrM3B2N1pBYU40M1QtOWc="
  ];
  var GEMINI_VISION_MODELS = [
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite"
  ];
  var MT5_VISION_SYSTEM_PROMPT =
    "Kamu adalah mesin ekstraksi data presisi tinggi khusus screenshot MetaTrader 5 (MT5), MetaTrader 4 (MT4), dan riwayat transaksi trading (Android, iOS, Desktop).\n" +
    "TUGAS UTAMA:\n" +
    "• Baca SEMUA baris trade yang terlihat pada screenshot secara lengkap dari atas ke bawah (bisa 1 trade atau 2–25 trade sekaligus dalam tab History/Riwayat MT5).\n" +
    "• Abaikan baris Balance / Deposit / Withdrawal / Credit / Total Profit ringkasan bagian atas (jangan masukkan ke array trades).\n" +
    "• Perhatikan tanda minus (-) dan angka merah WAJIB bernilai negatif (contoh: -12.43). Angka biru/hijau positif (contoh: 42.50).\n" +
    "• Pada baris MT5 Android/iOS format umum:\n" +
    "  Baris kiri atas: 'XAUUSDc, buy 0.01' atau 'GOLD, sell 0.03'\n" +
    "  Baris kiri bawah: '3 851.35 -> 3 838.92' (kiri = entryPrice, kanan = exitPrice)\n" +
    "  Baris kanan atas: '2026.11.18 02:15:20' (closeTime)\n" +
    "  Baris kanan bawah: '-12.43' (profit)\n" +
    "• Jika detail baris terbuka, baca juga sl, tp, swap, commission, ticket, openTime.\n" +
    "• Jika akun cent (simbol ada akhiran 'c' seperti XAUUSDc atau currency USC/CENT), set isCentAccount: true.\n" +
    "• DILARANG mengarang angka yang tidak terlihat. Kembalikan JSON valid sesuai format:\n" +
    "{\n" +
    "  \"accountCurrency\": \"USC\" atau \"USD\",\n" +
    "  \"isCentAccount\": true/false,\n" +
    "  \"notes\": \"catatan jika ada\",\n" +
    "  \"trades\": [\n" +
    "    {\n" +
    "      \"entryType\": \"trade\",\n" +
    "      \"symbol\": \"XAUUSDc\",\n" +
    "      \"direction\": \"buy\",\n" +
    "      \"lot\": 0.01,\n" +
    "      \"entryPrice\": 3851.35,\n" +
    "      \"exitPrice\": 3838.92,\n" +
    "      \"sl\": null,\n" +
    "      \"tp\": null,\n" +
    "      \"profit\": -12.43,\n" +
    "      \"closeTime\": \"2026.11.18 02:15:20\"\n" +
    "    }\n" +
    "  ]\n" +
    "}";
  var DISCIPLINE_TAGS = [
    { label: "Sesuai Plan", good: true },
    { label: "FOMO", good: false },
    { label: "Entry Kepagian", good: false },
    { label: "Geser SL", good: false },
    { label: "Overtrade", good: false },
    { label: "Revenge Trade", good: false }
  ];

  var scanState = {
    files: [], // [{ file, url, name, compressedDataUrl }]
    rawResults: [], // [{ imageIndex, data }]
    trades: [], // normalized items ready for batch review
    accountMode: "REAL",
    isCentAccount: false,
    brokerOffsetHours: 5,
    attachScreenshots: false,
    attachUserTouched: false,
    defaultSetup: "",
    defaultMistakes: "",
    scanning: false,
    saving: false,
    expandedTempId: "",
    statusText: "",
    statusKind: "" // "" | "error" | "success"
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatSignedUsd(value) {
    var num = Number(value || 0);
    var sign = num > 0 ? "+" : num < 0 ? "-" : "";
    return sign + "$" + Math.abs(num).toFixed(2);
  }

  function getOcr() {
    return window.AmyMt5Ocr;
  }

  function getBridge() {
    return window.AmyJournalBridge || null;
  }

  function getApiBaseUrl() {
    try {
      var origin = window.location && window.location.origin ? String(window.location.origin) : "";
      var protocol = window.location && window.location.protocol ? String(window.location.protocol) : "";
      if (origin.indexOf("appassets.androidplatform.net") >= 0 || protocol === "file:") {
        return "https://amy-fx.vercel.app";
      }
    } catch (_) {}
    return "";
  }

  function isLikelyImageFile(file) {
    if (!file) return false;
    var type = String(file.type || "").trim().toLowerCase();
    var name = String(file.name || "").trim().toLowerCase();
    if (/^image\//.test(type)) return true;
    if (/\.(png|jpe?g|webp|gif|bmp|heic|heif|avif)$/.test(name)) return true;
    // Android WebView / Gallery content:// pickers often return empty MIME or octet-stream
    if (!type || type === "application/octet-stream") {
      if (/\.(pdf|mp4|mkv|mov|avi|webm|zip|csv|json|txt|doc|docx|xls|xlsx|mp3|wav)$/.test(name)) {
        return false;
      }
      return true;
    }
    return false;
  }

  function extractMimeFromDataUrl(dataUrl) {
    var m = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/i);
    if (!m) return "image/jpeg";
    var mime = m[1].toLowerCase();
    return mime === "image/jpg" ? "image/jpeg" : mime;
  }

  function setStatus(text, kind) {
    scanState.statusText = text || "";
    scanState.statusKind = kind || "";
    var el = byId("mt5ScanStatus");
    if (!el) return;
    el.textContent = scanState.statusText;
    el.className = "jl-mt5-status" + (kind ? " is-" + kind : "");
    el.hidden = !scanState.statusText;
  }

  function revokeFileUrls() {
    scanState.files.forEach(function (item) {
      if (item && item.url) {
        try { URL.revokeObjectURL(item.url); } catch (_) {}
      }
    });
  }

  function resetScanState(keepSettings) {
    revokeFileUrls();
    var fileInput = byId("mt5FileInput");
    if (fileInput) {
      try { fileInput.value = ""; } catch (_) {}
    }
    var ocr = getOcr();
    var saved = keepSettings ? {
      brokerOffsetHours: scanState.brokerOffsetHours,
      isCentAccount: scanState.isCentAccount
    } : (ocr ? ocr.loadOcrSettings() : { brokerOffsetHours: 5, isCentAccount: false });

    var bridge = getBridge();
    var activeFilter = bridge && typeof bridge.getActiveAccountMode === "function"
      ? bridge.getActiveAccountMode()
      : "REAL";

    scanState.files = [];
    scanState.rawResults = [];
    scanState.trades = [];
    scanState.accountMode = activeFilter === "SIM" ? "SIM" : "REAL";
    scanState.isCentAccount = Boolean(saved.isCentAccount);
    scanState.brokerOffsetHours = Number.isFinite(Number(saved.brokerOffsetHours)) ? Number(saved.brokerOffsetHours) : 5;
    scanState.attachScreenshots = false;
    scanState.attachUserTouched = false;
    scanState.defaultSetup = "";
    scanState.defaultMistakes = "";
    scanState.scanning = false;
    scanState.saving = false;
    scanState.expandedTempId = "";
    setStatus("", "");
  }

  function compressImageToJpegDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Gagal membaca file gambar dari perangkat.")); };
      reader.onload = function () {
        var rawResult = typeof reader.result === "string" ? reader.result : "";
        if (!rawResult) {
          reject(new Error("Isi gambar kosong atau gagal dibaca."));
          return;
        }
        var img = new Image();
        img.onerror = function () {
          // Fallback to raw data URL if image decode fails (e.g. non-standard env)
          if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(rawResult)) {
            resolve(rawResult);
          } else {
            reject(new Error("Format gambar tidak dapat dibaca. Coba gunakan screenshot PNG/JPG standar."));
          }
        };
        img.onload = function () {
          try {
            var w = img.naturalWidth || img.width || 1000;
            var h = img.naturalHeight || img.height || 1000;
            var scale = w > MAX_IMAGE_WIDTH ? (MAX_IMAGE_WIDTH / w) : 1;
            var targetW = Math.max(1, Math.round(w * scale));
            var targetH = Math.max(1, Math.round(h * scale));
            var canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            var ctx = canvas.getContext("2d");
            if (!ctx) {
              resolve(rawResult);
              return;
            }
            ctx.fillStyle = "#0b111c";
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.drawImage(img, 0, 0, targetW, targetH);
            resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
          } catch (_) {
            resolve(rawResult);
          }
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    });
  }

  function rebuildTradesFromRaw() {
    var ocr = getOcr();
    if (!ocr) return;
    var bridge = getBridge();
    var existing = bridge && typeof bridge.getExistingJournals === "function"
      ? bridge.getExistingJournals()
      : [];

    // Preserve user edits per index if re-normalizing after toggling Cent/Offset
    var prevEdits = {};
    scanState.trades.forEach(function (t, idx) {
      prevEdits[idx] = {
        setup: t.setup,
        mistakes: t.mistakes,
        emotion: t.emotion,
        evaluation: t.evaluation,
        manualPnl: t._manualPnl,
        manualRr: t._manualRr
      };
    });

    var combined = [];
    scanState.rawResults.forEach(function (entry) {
      var normalized = ocr.normalizeMt5ScanPayload(entry.data, {
        isCentAccount: scanState.isCentAccount,
        brokerOffsetHours: scanState.brokerOffsetHours,
        sourceImageIndex: entry.imageIndex
      });
      normalized.trades.forEach(function (t) {
        combined.push(t);
      });
    });

    var annotated = ocr.annotateDuplicates(combined, existing);
    annotated.forEach(function (t, idx) {
      var prev = prevEdits[idx];
      if (!prev) return;
      if (prev.setup) t.setup = prev.setup;
      if (prev.mistakes) t.mistakes = prev.mistakes;
      if (prev.emotion) t.emotion = prev.emotion;
      if (prev.evaluation) t.evaluation = prev.evaluation;
      if (prev.manualPnl != null) {
        t.pnlMoney = prev.manualPnl;
        t._manualPnl = prev.manualPnl;
        t.result = t.pnlMoney > 0.25 ? "Win" : t.pnlMoney < -0.25 ? "Loss" : "BE";
      }
      if (prev.manualRr != null) {
        t.riskReward = prev.manualRr;
        t._manualRr = prev.manualRr;
      }
    });

    scanState.trades = annotated;
    if (!scanState.attachUserTouched) {
      scanState.attachScreenshots = annotated.length === 1;
    }
  }

  function syncSettingsUi() {
    var dialog = byId("mt5ScanDialog");
    if (!dialog) return;
    dialog.querySelectorAll("[data-mt5-account-mode]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-mt5-account-mode") === scanState.accountMode);
    });
    var centInput = byId("mt5CentToggle");
    if (centInput) centInput.checked = scanState.isCentAccount;
    var offsetSelect = byId("mt5OffsetSelect");
    if (offsetSelect) offsetSelect.value = String(scanState.brokerOffsetHours);
    var attachInput = byId("mt5AttachToggle");
    if (attachInput) attachInput.checked = scanState.attachScreenshots;
  }

  function renderFileThumbs() {
    var host = byId("mt5ThumbStrip");
    var scanBtn = byId("mt5StartScanBtn");
    var dropMeta = byId("mt5DropMeta");
    if (!host) return;

    host.replaceChildren();
    host.hidden = scanState.files.length === 0;

    if (dropMeta) {
      dropMeta.textContent = scanState.files.length
        ? scanState.files.length + " gambar siap dipindai (maks " + MAX_FILES + ")"
        : "Pilih 1 atau banyak SS History MT5 sekaligus (PNG, JPG, WEBP)";
    }

    scanState.files.forEach(function (item, idx) {
      var chip = document.createElement("div");
      chip.className = "jl-mt5-thumb";
      chip.innerHTML =
        '<img src="' + escapeHtml(item.url) + '" alt="Screenshot MT5 ' + (idx + 1) + '">' +
        '<button type="button" class="jl-mt5-thumb-del" data-remove-thumb="' + idx + '" aria-label="Hapus gambar ' + (idx + 1) + '">×</button>';
      host.appendChild(chip);
    });

    if (scanBtn) {
      scanBtn.disabled = scanState.files.length === 0 || scanState.scanning;
      scanBtn.textContent = scanState.scanning
        ? "Memindai screenshot…"
        : scanState.files.length > 1
          ? "Scan " + scanState.files.length + " Screenshot (AI)"
          : "Scan Semua Trade (AI)";
    }
  }

  function getSelectedTrades() {
    return scanState.trades.filter(function (t) { return t.selected; });
  }

  function renderReviewList() {
    var reviewSection = byId("mt5ReviewSection");
    var listEl = byId("mt5ReviewList");
    var summaryEl = byId("mt5ReviewSummary");
    var saveBtn = byId("mt5SaveBatchBtn");
    var formBtn = byId("mt5OpenSingleFormBtn");
    var toggleAllBtn = byId("mt5ToggleAllBtn");
    if (!reviewSection || !listEl) return;

    var hasTrades = scanState.trades.length > 0;
    reviewSection.hidden = !hasTrades;

    var selected = getSelectedTrades();
    var netPnl = selected.reduce(function (sum, t) { return sum + (Number(t.pnlMoney) || 0); }, 0);
    var dupCount = scanState.trades.filter(function (t) { return t.isDuplicate; }).length;

    if (summaryEl) {
      var netClass = netPnl > 0 ? "is-pos" : netPnl < 0 ? "is-neg" : "";
      summaryEl.innerHTML =
        '<span>Terbaca <strong>' + scanState.trades.length + '</strong> trade · Dipilih <strong>' + selected.length + '</strong>' +
        (dupCount ? ' · <em class="jl-mt5-dup-note">' + dupCount + ' duplikat</em>' : '') +
        '</span>' +
        '<strong class="jp-tabular ' + netClass + '">' + formatSignedUsd(netPnl) + '</strong>';
    }

    if (toggleAllBtn) {
      var allSelected = hasTrades && selected.length === scanState.trades.length;
      toggleAllBtn.textContent = allSelected ? "Batal Semua" : "Pilih Semua";
    }

    if (saveBtn) {
      saveBtn.disabled = scanState.saving || selected.length === 0;
      saveBtn.hidden = !hasTrades;
      saveBtn.textContent = scanState.saving
        ? "Menyimpan…"
        : "Simpan Terpilih (" + selected.length + ")";
    }

    if (formBtn) {
      formBtn.hidden = selected.length !== 1;
    }

    listEl.replaceChildren();
    scanState.trades.forEach(function (t) {
      var row = document.createElement("div");
      var isExpanded = scanState.expandedTempId === t.tempId;
      row.className = "jl-mt5-row" + (t.selected ? "" : " is-dim") + (t.isDuplicate ? " is-dup" : "");
      row.setAttribute("data-mt5-row", t.tempId);

      var dirClass = t.direction === "Buy" ? "is-buy" : "is-sell";
      var pnlClass = t.pnlMoney > 0 ? "is-pos" : t.pnlMoney < 0 ? "is-neg" : "is-be";
      var priceLine = [];
      if (t.lot != null) priceLine.push(t.lot + " lot");
      if (t.entryPrice != null && t.exitPrice != null) {
        priceLine.push(t.entryPrice.toFixed(2) + " → " + t.exitPrice.toFixed(2));
      }
      if (t.pnlPips != null) {
        priceLine.push((t.pnlPips > 0 ? "+" : "") + t.pnlPips + " pips");
      }
      if (t.riskReward != null) {
        priceLine.push("RR " + t.riskReward);
      }
      var timeMeta = [t.date, t.timeWita ? t.timeWita + " WITA" : "", t.session].filter(Boolean).join(" · ");
      var activeTagHtml = t.mistakes
        ? '<span class="jl-mt5-tag-inline">' + escapeHtml(t.mistakes) + '</span>'
        : "";
      var setupInline = t.setup ? '<span class="jl-mt5-tag-inline">' + escapeHtml(t.setup) + '</span>' : "";

      var editorHtml = "";
      if (isExpanded) {
        var chipButtons = DISCIPLINE_TAGS.map(function (tag) {
          var active = (t.mistakes || "").toLowerCase().indexOf(tag.label.toLowerCase()) >= 0;
          return (
            '<button type="button" class="jl-mistake-chip' + (tag.good ? " is-good" : "") + (active ? " is-active" : "") +
            '" data-row-chip="' + escapeHtml(tag.label) + '" data-temp-id="' + escapeHtml(t.tempId) + '">' +
            escapeHtml(tag.label) + "</button>"
          );
        }).join("");

        editorHtml =
          '<div class="jl-mt5-row-editor">' +
            '<div class="jl-mt5-edit-grid">' +
              '<label class="jl-field"><span>P/L ($)</span>' +
                '<input type="number" step="0.01" inputmode="decimal" data-row-field="pnlMoney" data-temp-id="' + escapeHtml(t.tempId) + '" value="' + escapeHtml(t.pnlMoney) + '">' +
              '</label>' +
              '<label class="jl-field"><span>R:R</span>' +
                '<input type="number" step="0.1" min="0" inputmode="decimal" data-row-field="riskReward" data-temp-id="' + escapeHtml(t.tempId) + '" value="' + escapeHtml(t.riskReward != null ? t.riskReward : "") + '" placeholder="2.0">' +
              '</label>' +
              '<label class="jl-field"><span>Sesi</span>' +
                '<select data-row-field="session" data-temp-id="' + escapeHtml(t.tempId) + '">' +
                  '<option value="">Otomatis</option>' +
                  '<option value="Asia"' + (t.session === "Asia" ? " selected" : "") + '>Asia</option>' +
                  '<option value="London"' + (t.session === "London" ? " selected" : "") + '>London</option>' +
                  '<option value="NY AM"' + (t.session === "NY AM" ? " selected" : "") + '>NY AM</option>' +
                  '<option value="NY PM"' + (t.session === "NY PM" ? " selected" : "") + '>NY PM</option>' +
                '</select>' +
              '</label>' +
              '<label class="jl-field"><span>Setup</span>' +
                '<input type="text" maxlength="80" data-row-field="setup" data-temp-id="' + escapeHtml(t.tempId) + '" value="' + escapeHtml(t.setup) + '" placeholder="OB + FVG, Sweep">' +
              '</label>' +
            '</div>' +
            '<div class="jl-mistake-chips">' + chipButtons + '</div>' +
            '<div class="jl-mt5-edit-actions">' +
              '<button type="button" class="jl-ghost-btn jl-btn-xs" data-row-open-form="' + escapeHtml(t.tempId) + '">Buka di Form Lengkap →</button>' +
            '</div>' +
          '</div>';
      }

      row.innerHTML =
        '<div class="jl-mt5-row-main">' +
          '<label class="jl-mt5-check">' +
            '<input type="checkbox" data-row-select="' + escapeHtml(t.tempId) + '"' + (t.selected ? " checked" : "") + ' aria-label="Pilih trade ' + escapeHtml(t.market) + '">' +
          '</label>' +
          '<button type="button" class="jl-mt5-row-body" data-row-expand="' + escapeHtml(t.tempId) + '">' +
            '<div class="jl-mt5-row-top">' +
              '<span class="jl-mt5-dir ' + dirClass + '">' + escapeHtml(t.direction.toUpperCase()) + '</span>' +
              '<strong class="jl-mt5-pair">' + escapeHtml(t.market) + '</strong>' +
              (t.isDuplicate ? '<span class="jl-mt5-dup-badge">Duplikat</span>' : '') +
              '<strong class="jl-mt5-pnl jp-tabular ' + pnlClass + '">' + formatSignedUsd(t.pnlMoney) + '</strong>' +
            '</div>' +
            '<div class="jl-mt5-row-sub">' + escapeHtml(priceLine.join(" · ") || t.result) + '</div>' +
            '<div class="jl-mt5-row-meta">' +
              '<span>' + escapeHtml(timeMeta || "Waktu tidak terbaca") + '</span>' +
              setupInline + activeTagHtml +
            '</div>' +
          '</button>' +
        '</div>' +
        editorHtml;

      listEl.appendChild(row);
    });
  }

  function renderAll() {
    syncSettingsUi();
    renderFileThumbs();
    renderReviewList();
  }

  function openScanDialog() {
    var dialog = byId("mt5ScanDialog");
    if (!dialog) return;
    resetScanState(false);
    renderAll();
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    if (window.AmyScrollGuard && typeof window.AmyScrollGuard.lock === "function") {
      window.AmyScrollGuard.lock("mt5-scan-dialog");
    }
  }

  function closeScanDialog() {
    var dialog = byId("mt5ScanDialog");
    if (dialog && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    if (window.AmyScrollGuard && typeof window.AmyScrollGuard.unlock === "function") {
      window.AmyScrollGuard.unlock("mt5-scan-dialog");
    }
  }

  function handleFileSelection(fileList) {
    var allFiles = Array.from(fileList || []).filter(Boolean);
    if (!allFiles.length) return;

    var incoming = allFiles.filter(isLikelyImageFile);
    if (!incoming.length) {
      setStatus("Format file tidak didukung. Pilih gambar screenshot (PNG, JPG, atau WEBP).", "error");
      return;
    }

    var remaining = MAX_FILES - scanState.files.length;
    if (remaining <= 0) {
      setStatus("Maksimal " + MAX_FILES + " screenshot dalam satu kali scan.", "error");
      return;
    }

    incoming.slice(0, remaining).forEach(function (file) {
      var previewUrl = "";
      try {
        previewUrl = URL.createObjectURL(file);
      } catch (_) {
        previewUrl = "";
      }
      var entry = {
        file: file,
        name: file.name || ("mt5-ss-" + (scanState.files.length + 1) + ".jpg"),
        url: previewUrl,
        compressedDataUrl: ""
      };
      scanState.files.push(entry);

      // Eagerly pre-read/compress so Android WebView content:// URIs never expire before Scan is tapped
      compressImageToJpegDataUrl(file).then(function (dataUrl) {
        entry.compressedDataUrl = dataUrl;
        if (!entry.url && dataUrl) {
          entry.url = dataUrl;
        }
        renderFileThumbs();
      }).catch(function () {
        renderFileThumbs();
      });
    });

    setStatus("", "");
    renderFileThumbs();
  }

  function decodeKey(b64) {
    try {
      if (typeof atob === "function") return atob(b64).trim();
      if (typeof Buffer !== "undefined") return Buffer.from(b64, "base64").toString("utf-8").trim();
    } catch (_) {}
    return "";
  }

  function isValidGeminiKey(key) {
    var k = String(key || "").trim();
    return Boolean(k && k.length >= 20 && (k.indexOf("AIza") === 0 || k.indexOf("AQ.") === 0));
  }

  function getAvailableGeminiKeys() {
    var keys = [];
    try {
      var saved = JSON.parse(localStorage.getItem("tradingLibraryManager.assistantSettings.v1") || "{}");
      if (saved && isValidGeminiKey(saved.apiKey)) {
        keys.push(saved.apiKey.trim());
      }
    } catch (_) {}
    try {
      var userKey = localStorage.getItem("amy_user_gemini_api_key");
      if (isValidGeminiKey(userKey)) {
        keys.push(userKey.trim());
      }
    } catch (_) {}
    try {
      var standaloneKey = localStorage.getItem("gemini_api_key");
      if (isValidGeminiKey(standaloneKey)) {
        keys.push(standaloneKey.trim());
      }
    } catch (_) {}
    ENCODED_FALLBACK_KEYS.forEach(function (b64) {
      var k = decodeKey(b64);
      if (isValidGeminiKey(k) && keys.indexOf(k) === -1) {
        keys.push(k);
      }
    });
    return keys;
  }

  async function callDirectGeminiVision(base64Data, mimeType) {
    var rawBase64 = String(base64Data || "").trim();
    if (rawBase64.indexOf("base64,") !== -1) {
      rawBase64 = rawBase64.split("base64,")[1];
    }
    if (!rawBase64) throw new Error("Data gambar kosong.");

    var keys = getAvailableGeminiKeys();
    if (!keys.length) {
      throw new Error("Tidak ada API Key Gemini yang tersedia.");
    }

    var lastError = null;
    for (var k = 0; k < keys.length; k++) {
      var apiKey = keys[k];
      for (var m = 0; m < GEMINI_VISION_MODELS.length; m++) {
        var model = GEMINI_VISION_MODELS[m];
        try {
          var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);
          var resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "User-Agent": "aistudio-build"
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: MT5_VISION_SYSTEM_PROMPT }] },
              contents: [{
                role: "user",
                parts: [
                  { inlineData: { mimeType: mimeType || "image/jpeg", data: rawBase64 } },
                  { text: "Ekstrak seluruh baris transaksi trading MT5/MT4 dari screenshot ini menjadi JSON terstruktur." }
                ]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (!resp.ok) {
            lastError = new Error("Gemini API HTTP " + resp.status);
            if (resp.status === 429) break;
            continue;
          }

          var result = await resp.json();
          var parts = result && result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts;
          var text = parts && parts.map(function (p) { return p.text || ""; }).join("").trim();
          if (text) {
            var fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
            var cleanText = fenced ? fenced[1].trim() : text;
            var parsed = JSON.parse(cleanText);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed.trades)) {
              return { ok: true, data: parsed, model: model };
            }
          }
        } catch (e) {
          lastError = e;
        }
      }
    }
    throw lastError || new Error("Gagal membaca screenshot via Gemini Vision.");
  }

  async function callServerProxy(compressedDataUrl, mimeType) {
    var endpoint = getApiBaseUrl() + "/api/mt5-scan";
    var resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: compressedDataUrl,
        mimeType: mimeType || "image/jpeg"
      })
    });
    var json = await resp.json().catch(function () { return null; });
    if (!resp.ok || !json || !json.ok || !json.data) {
      throw new Error((json && json.error) || "Gagal memindai screenshot MT5 (HTTP " + resp.status + ").");
    }
    return json;
  }

  async function runMt5Scan() {
    if (!scanState.files.length || scanState.scanning) return;
    scanState.scanning = true;
    scanState.rawResults = [];
    scanState.trades = [];
    renderFileThumbs();
    renderReviewList();

    var total = scanState.files.length;
    var notesList = [];
    var detectedCentAny = false;

    try {
      for (var i = 0; i < total; i += 1) {
        var item = scanState.files[i];
        setStatus("Mengompresi & memindai gambar " + (i + 1) + " dari " + total + "…", "");
        if (!item.compressedDataUrl) {
          item.compressedDataUrl = await compressImageToJpegDataUrl(item.file);
        }

        var mimeType = extractMimeFromDataUrl(item.compressedDataUrl);
        var json = null;
        try {
          json = await callDirectGeminiVision(item.compressedDataUrl, mimeType);
        } catch (directErr) {
          try {
            json = await callServerProxy(item.compressedDataUrl, mimeType);
          } catch (proxyErr) {
            throw directErr || proxyErr;
          }
        }

        if (!json || !json.ok || !json.data) {
          throw new Error("Gagal memproses data screenshot MT5.");
        }

        if (json.data.isCentAccount || String(json.data.accountCurrency || "").toUpperCase() === "USC") {
          detectedCentAny = true;
        }
        if (json.data.notes) notesList.push(json.data.notes);
        scanState.rawResults.push({ imageIndex: i, data: json.data });
      }

      if (detectedCentAny && !scanState.isCentAccount) {
        scanState.isCentAccount = true;
      }

      rebuildTradesFromRaw();

      if (!scanState.trades.length) {
        var hint = notesList.filter(Boolean).join(" ");
        setStatus(hint || "Tidak ada baris trade MT5 yang terbaca pada gambar. Coba gunakan screenshot History MT5 yang lebih jelas.", "error");
      } else {
        var dupCount = scanState.trades.filter(function (t) { return t.isDuplicate; }).length;
        setStatus(
          "Berhasil membaca " + scanState.trades.length + " trade" +
          (detectedCentAny ? " (terdeteksi akun Cent/USC ÷100)" : "") +
          (dupCount ? " · " + dupCount + " sudah ada di Jurnal (otomatis tidak dicentang)." : ". Periksa lalu klik Simpan Terpilih."),
          "success"
        );
      }
    } catch (err) {
      setStatus(err && err.message ? err.message : "Pemindaian gagal. Coba lagi.", "error");
    } finally {
      scanState.scanning = false;
      renderAll();
    }
  }

  function applyGlobalDefaultsToSelected() {
    var setupInput = byId("mt5GlobalSetupInput");
    var setupVal = setupInput ? setupInput.value.trim() : scanState.defaultSetup;
    scanState.defaultSetup = setupVal;
    scanState.trades.forEach(function (t) {
      if (!t.selected) return;
      if (setupVal) t.setup = setupVal;
      if (scanState.defaultMistakes) t.mistakes = scanState.defaultMistakes;
    });
    renderReviewList();
  }

  function openSingleTradeInForm(tempId) {
    var target = tempId
      ? scanState.trades.find(function (t) { return t.tempId === tempId; })
      : getSelectedTrades()[0];
    if (!target) return;

    var bridge = getBridge();
    var ocr = getOcr();
    if (!bridge || typeof bridge.prefillJournalForm !== "function" || !ocr) return;

    var entry = ocr.buildJournalEntryFromMt5(target, {
      accountMode: scanState.accountMode,
      defaultSetup: scanState.defaultSetup,
      defaultMistakes: scanState.defaultMistakes
    });
    var sourceFileObj = scanState.files[target.sourceImageIndex] || scanState.files[0] || null;
    closeScanDialog();
    bridge.prefillJournalForm(entry, scanState.attachScreenshots && sourceFileObj ? sourceFileObj.file : null);
  }

  async function saveSelectedBatch() {
    var selected = getSelectedTrades();
    if (!selected.length || scanState.saving) return;

    var bridge = getBridge();
    var ocr = getOcr();
    if (!bridge || typeof bridge.saveBatchTrades !== "function" || !ocr) {
      setStatus("Bridge penyimpanan Jurnal belum siap.", "error");
      return;
    }

    scanState.saving = true;
    renderReviewList();

    try {
      var entries = selected.map(function (item) {
        return ocr.buildJournalEntryFromMt5(item, {
          accountMode: scanState.accountMode,
          defaultSetup: scanState.defaultSetup,
          defaultMistakes: scanState.defaultMistakes
        });
      });

      var attachFiles = scanState.attachScreenshots
        ? selected.map(function (item) {
            var src = scanState.files[item.sourceImageIndex] || scanState.files[0];
            return src ? src.file : null;
          })
        : [];

      await bridge.saveBatchTrades(entries, attachFiles);
      closeScanDialog();
      if (typeof window.showToast === "function") {
        window.showToast("✓ " + entries.length + " trade MT5 berhasil masuk Jurnal", "success");
      }
    } catch (err) {
      setStatus(err && err.message ? err.message : "Gagal menyimpan trade ke Jurnal.", "error");
      scanState.saving = false;
      renderReviewList();
    }
  }

  function bindEvents() {
    var openBtn = byId("scanMt5Btn");
    var formScanBtn = byId("journalFormScanMt5Btn");
    var closeBtn = byId("closeMt5ScanBtn");
    var cancelBtn = byId("mt5CancelBtn");
    var dialog = byId("mt5ScanDialog");
    var fileInput = byId("mt5FileInput");
    var startBtn = byId("mt5StartScanBtn");
    var thumbStrip = byId("mt5ThumbStrip");
    var centToggle = byId("mt5CentToggle");
    var offsetSelect = byId("mt5OffsetSelect");
    var attachToggle = byId("mt5AttachToggle");
    var toggleAllBtn = byId("mt5ToggleAllBtn");
    var reviewList = byId("mt5ReviewList");
    var saveBatchBtn = byId("mt5SaveBatchBtn");
    var openSingleBtn = byId("mt5OpenSingleFormBtn");
    var applyGlobalBtn = byId("mt5ApplyGlobalBtn");
    var globalChips = byId("mt5GlobalChips");

    if (openBtn) openBtn.addEventListener("click", openScanDialog);
    if (formScanBtn) {
      formScanBtn.addEventListener("click", function () {
        var bridge = getBridge();
        if (bridge && typeof bridge.closeJournalEditor === "function") bridge.closeJournalEditor();
        openScanDialog();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeScanDialog);
    if (cancelBtn) cancelBtn.addEventListener("click", closeScanDialog);
    if (dialog) {
      dialog.addEventListener("click", function (ev) {
        if (ev.target === dialog) closeScanDialog();
      });
      dialog.addEventListener("cancel", function () {
        if (window.AmyScrollGuard && typeof window.AmyScrollGuard.unlock === "function") {
          window.AmyScrollGuard.unlock("mt5-scan-dialog");
        }
      });
      dialog.querySelectorAll("[data-mt5-account-mode]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          scanState.accountMode = btn.getAttribute("data-mt5-account-mode") === "SIM" ? "SIM" : "REAL";
          syncSettingsUi();
        });
      });
    }

    var dropLabel = byId("mt5DropLabel");
    if (dropLabel && fileInput) {
      dropLabel.addEventListener("click", function (ev) {
        if (ev.target !== fileInput) {
          fileInput.click();
        }
      });
      dropLabel.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          fileInput.click();
        }
      });
      dropLabel.addEventListener("dragover", function (ev) {
        ev.preventDefault();
        dropLabel.classList.add("is-dragover");
      });
      dropLabel.addEventListener("dragleave", function () {
        dropLabel.classList.remove("is-dragover");
      });
      dropLabel.addEventListener("drop", function (ev) {
        ev.preventDefault();
        dropLabel.classList.remove("is-dragover");
        if (ev.dataTransfer && ev.dataTransfer.files) {
          handleFileSelection(ev.dataTransfer.files);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var picked = fileInput.files ? Array.from(fileInput.files) : [];
        if (picked.length) {
          handleFileSelection(picked);
        }
      });
    }

    document.addEventListener("paste", function (ev) {
      if (!dialog || !dialog.open) return;
      var items = ev.clipboardData && ev.clipboardData.items ? Array.from(ev.clipboardData.items) : [];
      var pastedFiles = items
        .filter(function (it) { return it && it.kind === "file"; })
        .map(function (it) { return it.getAsFile(); })
        .filter(Boolean);
      if (pastedFiles.length) {
        handleFileSelection(pastedFiles);
      }
    });

    if (thumbStrip) {
      thumbStrip.addEventListener("click", function (ev) {
        var delBtn = ev.target && ev.target.closest ? ev.target.closest("[data-remove-thumb]") : null;
        if (!delBtn) return;
        var idx = Number(delBtn.getAttribute("data-remove-thumb"));
        if (!Number.isInteger(idx) || idx < 0 || idx >= scanState.files.length) return;
        var removed = scanState.files.splice(idx, 1)[0];
        if (removed && removed.url) {
          try { URL.revokeObjectURL(removed.url); } catch (_) {}
        }
        renderFileThumbs();
      });
    }

    if (startBtn) startBtn.addEventListener("click", runMt5Scan);

    if (centToggle) {
      centToggle.addEventListener("change", function () {
        scanState.isCentAccount = Boolean(centToggle.checked);
        var ocr = getOcr();
        if (ocr) ocr.saveOcrSettings({ brokerOffsetHours: scanState.brokerOffsetHours, isCentAccount: scanState.isCentAccount });
        if (scanState.rawResults.length) {
          rebuildTradesFromRaw();
          renderReviewList();
        }
      });
    }

    if (offsetSelect) {
      offsetSelect.addEventListener("change", function () {
        scanState.brokerOffsetHours = Number(offsetSelect.value) || 0;
        var ocr = getOcr();
        if (ocr) ocr.saveOcrSettings({ brokerOffsetHours: scanState.brokerOffsetHours, isCentAccount: scanState.isCentAccount });
        if (scanState.rawResults.length) {
          rebuildTradesFromRaw();
          renderReviewList();
        }
      });
    }

    if (attachToggle) {
      attachToggle.addEventListener("change", function () {
        scanState.attachUserTouched = true;
        scanState.attachScreenshots = Boolean(attachToggle.checked);
      });
    }

    if (toggleAllBtn) {
      toggleAllBtn.addEventListener("click", function () {
        var allSelected = scanState.trades.every(function (t) { return t.selected; });
        scanState.trades.forEach(function (t) { t.selected = !allSelected; });
        renderReviewList();
      });
    }

    if (applyGlobalBtn) {
      applyGlobalBtn.addEventListener("click", applyGlobalDefaultsToSelected);
    }

    if (globalChips) {
      globalChips.addEventListener("click", function (ev) {
        var chip = ev.target && ev.target.closest ? ev.target.closest("[data-global-chip]") : null;
        if (!chip) return;
        var label = chip.getAttribute("data-global-chip") || "";
        scanState.defaultMistakes = scanState.defaultMistakes === label ? "" : label;
        globalChips.querySelectorAll("[data-global-chip]").forEach(function (el) {
          el.classList.toggle("is-active", el.getAttribute("data-global-chip") === scanState.defaultMistakes);
        });
        if (scanState.defaultMistakes) {
          scanState.trades.forEach(function (t) {
            if (t.selected) t.mistakes = scanState.defaultMistakes;
          });
          renderReviewList();
        }
      });
    }

    if (reviewList) {
      reviewList.addEventListener("change", function (ev) {
        var el = ev.target;
        if (!el) return;
        if (el.hasAttribute("data-row-select")) {
          var id = el.getAttribute("data-row-select");
          var item = scanState.trades.find(function (t) { return t.tempId === id; });
          if (item) {
            item.selected = Boolean(el.checked);
            renderReviewList();
          }
          return;
        }
        if (el.hasAttribute("data-row-field")) {
          var fid = el.getAttribute("data-temp-id");
          var field = el.getAttribute("data-row-field");
          var rowItem = scanState.trades.find(function (t) { return t.tempId === fid; });
          if (!rowItem) return;
          if (field === "pnlMoney") {
            var val = Number.parseFloat(el.value);
            if (Number.isFinite(val)) {
              rowItem.pnlMoney = Math.round(val * 100) / 100;
              rowItem._manualPnl = rowItem.pnlMoney;
              rowItem.result = rowItem.pnlMoney > 0.25 ? "Win" : rowItem.pnlMoney < -0.25 ? "Loss" : "BE";
              renderReviewList();
            }
          } else if (field === "riskReward") {
            var rr = Number.parseFloat(el.value);
            rowItem.riskReward = Number.isFinite(rr) && rr > 0 ? Math.round(rr * 100) / 100 : null;
            rowItem._manualRr = rowItem.riskReward;
          } else if (field === "session") {
            rowItem.session = el.value || "";
          } else if (field === "setup") {
            rowItem.setup = el.value.trim();
          }
        }
      });

      reviewList.addEventListener("click", function (ev) {
        var formJump = ev.target && ev.target.closest ? ev.target.closest("[data-row-open-form]") : null;
        if (formJump) {
          openSingleTradeInForm(formJump.getAttribute("data-row-open-form"));
          return;
        }
        var chip = ev.target && ev.target.closest ? ev.target.closest("[data-row-chip]") : null;
        if (chip) {
          var tid = chip.getAttribute("data-temp-id");
          var label = chip.getAttribute("data-row-chip") || "";
          var target = scanState.trades.find(function (t) { return t.tempId === tid; });
          if (target) {
            target.mistakes = target.mistakes === label ? "" : label;
            renderReviewList();
          }
          return;
        }
        var expandBtn = ev.target && ev.target.closest ? ev.target.closest("[data-row-expand]") : null;
        if (expandBtn) {
          var eid = expandBtn.getAttribute("data-row-expand");
          scanState.expandedTempId = scanState.expandedTempId === eid ? "" : eid;
          renderReviewList();
        }
      });
    }

    if (saveBatchBtn) saveBatchBtn.addEventListener("click", saveSelectedBatch);
    if (openSingleBtn) {
      openSingleBtn.addEventListener("click", function () {
        openSingleTradeInForm("");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }

  window.AmyMt5ScanUI = {
    open: openScanDialog,
    close: closeScanDialog,
    getState: function () { return scanState; }
  };
})();
