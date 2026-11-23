/* Amy FX Pro — GitHub Private Repo Cloud Sync Engine (Pure Logic + Browser API) */
(function initAmyGitHubCloudSync(globalScope) {
  "use strict";

  const CONFIG_STORAGE_KEY = "amy_github_sync_config_v1";
  const DEFAULT_REPO = "suhaimitoamy/amyfx-private-sync";
  const DEFAULT_BRANCH = "main";
  const DEFAULT_FILE_PATH = "amyfx-cloud-sync.json";
  const AUTO_SYNC_DEBOUNCE_MS = 5000;
  const GITHUB_API_BASE = "https://api.github.com";
  const GITHUB_API_VERSION = "2022-11-28";
  const SNAPSHOT_SCHEMA_VERSION = 1;

  const DB_NAME = "tradingLibraryManager.files";
  const DB_VERSION = 2;
  const META_STORE = "metadata";
  const MAPPING_HISTORY_KEY = "amyfx.mapping.reaction_history.v1";
  const MAPPING_MAX_POI_RECORDS = 3000;
  const MAPPING_MAX_TIMELINE_EVENTS = 400;

  const REPO_SEGMENT_RE = /^[A-Za-z0-9_.-]{1,100}$/;
  const BRANCH_RE = /^[A-Za-z0-9._/-]{1,100}$/;
  const FILE_PATH_RE = /^[A-Za-z0-9._/-]{1,180}$/;

  const FORBIDDEN_SECRET_KEYS = new Set([
    "token",
    "pat",
    "githubToken",
    "github_token",
    "accessToken",
    "access_token",
    "apiKey",
    "api_key",
    "secret",
    "password",
    "amy_github_sync_config_v1",
    "license",
    "licenseKey"
  ]);

  let autoSyncTimer = null;
  let syncInFlight = false;

  function getDefaultStorage(storage) {
    if (storage) return storage;
    try {
      return globalScope.localStorage || null;
    } catch (_) {
      return null;
    }
  }

  function safeReadJson(storage, key, fallback) {
    const store = getDefaultStorage(storage);
    if (!store) return fallback;
    try {
      const raw = store.getItem(key);
      if (raw == null || raw === "") return fallback;
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function safeWriteJson(storage, key, value) {
    const store = getDefaultStorage(storage);
    if (!store) return false;
    try {
      store.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeReadString(storage, key, fallback = "") {
    const store = getDefaultStorage(storage);
    if (!store) return fallback;
    try {
      const val = store.getItem(key);
      return val == null ? fallback : String(val);
    } catch (_) {
      return fallback;
    }
  }

  function safeWriteString(storage, key, value) {
    const store = getDefaultStorage(storage);
    if (!store) return false;
    try {
      store.setItem(key, String(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function parseRepoSlug(rawRepo) {
    const cleaned = String(rawRepo || "").trim().replace(/^\/+|\/+$/g, "");
    if (!cleaned) {
      return { valid: false, owner: "", name: "", slug: "", error: "Format repositori wajib diisi (contoh: owner/nama-repo)." };
    }
    if (/^https?:\/\//i.test(cleaned) || cleaned.includes("://") || cleaned.includes("..")) {
      return { valid: false, owner: "", name: "", slug: "", error: "Isi hanya format owner/repo tanpa URL lengkap." };
    }
    const parts = cleaned.split("/");
    if (parts.length !== 2) {
      return { valid: false, owner: "", name: "", slug: "", error: "Format repositori harus owner/nama-repo." };
    }
    const [owner, name] = parts;
    if (!REPO_SEGMENT_RE.test(owner) || !REPO_SEGMENT_RE.test(name) || owner === "." || name === ".") {
      return { valid: false, owner: "", name: "", slug: "", error: "Nama owner atau repositori mengandung karakter tidak valid." };
    }
    return {
      valid: true,
      owner,
      name,
      slug: `${owner}/${name}`,
      error: ""
    };
  }

  function validateBranchName(rawBranch) {
    const branch = String(rawBranch || DEFAULT_BRANCH).trim();
    if (!branch || !BRANCH_RE.test(branch) || branch.startsWith("/") || branch.endsWith("/") || branch.includes("..") || branch.includes("//")) {
      return { valid: false, branch: "", error: "Nama branch tidak valid." };
    }
    return { valid: true, branch, error: "" };
  }

  function validateFilePath(rawPath) {
    const filePath = String(rawPath || DEFAULT_FILE_PATH).trim().replace(/^\/+/, "");
    if (!filePath || !FILE_PATH_RE.test(filePath) || filePath.includes("..") || filePath.includes("//") || !filePath.endsWith(".json")) {
      return { valid: false, filePath: "", error: "Nama file sync harus berupa file .json yang valid." };
    }
    return { valid: true, filePath, error: "" };
  }

  function encodeBase64Utf8(text) {
    const str = String(text ?? "");
    if (typeof TextEncoder !== "undefined") {
      const bytes = new TextEncoder().encode(str);
      if (typeof Buffer !== "undefined" && typeof btoa !== "function") {
        return Buffer.from(bytes).toString("base64");
      }
      const chunkSize = 0x8000;
      let binary = "";
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      return btoa(binary);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(str, "utf8").toString("base64");
    }
    return btoa(unescape(encodeURIComponent(str)));
  }

  function decodeBase64Utf8(base64Str) {
    const normalized = String(base64Str || "").replace(/\s+/g, "");
    if (!normalized) return "";
    if (typeof TextDecoder !== "undefined" && typeof atob === "function") {
      const binary = atob(normalized);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder("utf-8").decode(bytes);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(normalized, "base64").toString("utf8");
    }
    return decodeURIComponent(escape(atob(normalized)));
  }

  function generateDeviceId() {
    const rand = Math.random().toString(36).slice(2, 8);
    const stamp = Date.now().toString(36).slice(-4);
    return `dev_${stamp}${rand}`;
  }

  function loadConfig(storage) {
    const saved = safeReadJson(storage, CONFIG_STORAGE_KEY, null);
    const base = saved && typeof saved === "object" ? saved : {};
    const deviceId = typeof base.deviceId === "string" && base.deviceId.trim()
      ? base.deviceId.trim()
      : generateDeviceId();

    const config = {
      repo: typeof base.repo === "string" && base.repo.trim() ? base.repo.trim() : DEFAULT_REPO,
      branch: typeof base.branch === "string" && base.branch.trim() ? base.branch.trim() : DEFAULT_BRANCH,
      filePath: typeof base.filePath === "string" && base.filePath.trim() ? base.filePath.trim() : DEFAULT_FILE_PATH,
      token: typeof base.token === "string" ? base.token.trim() : "",
      autoSync: Boolean(base.autoSync),
      deviceId,
      isPrivate: typeof base.isPrivate === "boolean" ? base.isPrivate : null,
      connected: Boolean(base.connected && base.token),
      lastSyncAt: typeof base.lastSyncAt === "string" ? base.lastSyncAt : "",
      lastRemoteSha: typeof base.lastRemoteSha === "string" ? base.lastRemoteSha : "",
      lastRemoteUpdatedAt: typeof base.lastRemoteUpdatedAt === "string" ? base.lastRemoteUpdatedAt : ""
    };

    if (!base.deviceId && getDefaultStorage(storage)) {
      safeWriteJson(storage, CONFIG_STORAGE_KEY, config);
    }
    return config;
  }

  function saveConfig(patch, storage) {
    const current = loadConfig(storage);
    const next = {
      ...current,
      ...(patch && typeof patch === "object" ? patch : {})
    };
    next.repo = String(next.repo || DEFAULT_REPO).trim();
    next.branch = String(next.branch || DEFAULT_BRANCH).trim();
    next.filePath = String(next.filePath || DEFAULT_FILE_PATH).trim();
    next.token = String(next.token || "").trim();
    next.autoSync = Boolean(next.autoSync);
    if (!next.token) {
      next.connected = false;
      next.isPrivate = null;
    }
    safeWriteJson(storage, CONFIG_STORAGE_KEY, next);
    return next;
  }

  function disconnectConfig(storage) {
    cancelAutoSync();
    const store = getDefaultStorage(storage);
    const current = loadConfig(storage);
    const cleared = {
      repo: current.repo || DEFAULT_REPO,
      branch: current.branch || DEFAULT_BRANCH,
      filePath: DEFAULT_FILE_PATH,
      token: "",
      autoSync: false,
      deviceId: current.deviceId || generateDeviceId(),
      isPrivate: null,
      connected: false,
      lastSyncAt: "",
      lastRemoteSha: "",
      lastRemoteUpdatedAt: ""
    };
    if (store) {
      try {
        store.setItem(CONFIG_STORAGE_KEY, JSON.stringify(cleared));
      } catch (_) {}
    }
    emitStatusEvent("disconnected", cleared);
    return cleared;
  }

  function stripSecretsDeep(value) {
    if (Array.isArray(value)) {
      return value.map(stripSecretsDeep);
    }
    if (value && typeof value === "object") {
      const out = {};
      Object.keys(value).forEach((key) => {
        if (FORBIDDEN_SECRET_KEYS.has(key)) return;
        const val = value[key];
        if (typeof val === "function" || val === undefined) return;
        if (typeof Blob !== "undefined" && val instanceof Blob) return;
        out[key] = stripSecretsDeep(val);
      });
      return out;
    }
    return value;
  }

  function sanitizeAttachmentForCloud(att) {
    if (!att || typeof att !== "object") return null;
    const cleaned = {};
    const allowedFields = ["id", "name", "type", "kind", "size", "fileId", "createdAt", "updatedAt"];
    allowedFields.forEach((field) => {
      if (att[field] !== undefined && att[field] !== null) {
        cleaned[field] = att[field];
      }
    });
    return Object.keys(cleaned).length ? cleaned : null;
  }

  function sanitizeJournalForCloud(entry) {
    if (!entry || typeof entry !== "object") return null;
    const copy = {};
    Object.keys(entry).forEach((key) => {
      if (FORBIDDEN_SECRET_KEYS.has(key)) return;
      if (key === "blob" || key === "file" || key === "data" || key === "objectUrl" || key === "videoThumb" || key === "_syncPromise") {
        return;
      }
      if (key === "attachments") {
        copy.attachments = Array.isArray(entry.attachments)
          ? entry.attachments.map(sanitizeAttachmentForCloud).filter(Boolean)
          : [];
        return;
      }
      const val = entry[key];
      if (typeof val === "function" || val === undefined) return;
      if (typeof Blob !== "undefined" && val instanceof Blob) return;
      copy[key] = stripSecretsDeep(val);
    });
    return copy;
  }

  function sanitizeMappingHistoryForCloud(raw) {
    if (!raw || typeof raw !== "object") {
      return { version: 2, poiRecords: [], timelineEvents: [], dailyArchive: {} };
    }
    const poiRecords = Array.isArray(raw.poiRecords)
      ? raw.poiRecords
          .filter((r) => r && typeof r === "object" && r.id && Number.isFinite(Number(r.touchedAt)))
          .slice(0, MAPPING_MAX_POI_RECORDS)
          .map((r) => {
            const copy = stripSecretsDeep(r);
            delete copy.touches;
            return copy;
          })
      : [];
    const timelineEvents = Array.isArray(raw.timelineEvents)
      ? raw.timelineEvents
          .filter((e) => e && typeof e === "object" && e.id && Number.isFinite(Number(e.ts)))
          .slice(0, MAPPING_MAX_TIMELINE_EVENTS)
          .map((e) => stripSecretsDeep(e))
      : [];
    const dailyArchive = {};
    if (raw.dailyArchive && typeof raw.dailyArchive === "object" && !Array.isArray(raw.dailyArchive)) {
      Object.keys(raw.dailyArchive).forEach((dateKey) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
        const entry = raw.dailyArchive[dateKey];
        if (entry && typeof entry === "object" && Number(entry.total) > 0) {
          dailyArchive[dateKey] = stripSecretsDeep(entry);
        }
      });
    }
    return {
      version: 2,
      poiRecords,
      timelineEvents,
      dailyArchive
    };
  }

  function mergeMappingHistorySnapshots(localRaw, remoteRaw) {
    const local = sanitizeMappingHistoryForCloud(localRaw);
    const remote = sanitizeMappingHistoryForCloud(remoteRaw);
    const statusRank = { TESTING: 1, REACTING: 2, TP1_HIT: 3, SL_HIT: 4, TP2_HIT: 5 };
    const poiMap = new Map();

    const upsertPoi = (rec) => {
      if (!rec || !rec.id || !Number.isFinite(Number(rec.touchedAt))) return;
      const prev = poiMap.get(rec.id);
      if (!prev) {
        poiMap.set(rec.id, { ...rec });
        return;
      }
      const keepLive = prev.source === "LIVE" && rec.source !== "LIVE";
      const prevRank = statusRank[prev.status] || 0;
      const nextRank = statusRank[rec.status] || 0;
      const merged = keepLive ? { ...prev } : { ...prev, ...rec };
      if (prevRank > nextRank) {
        merged.status = prev.status;
        merged.resolvedAt = prev.resolvedAt;
      } else if (nextRank > prevRank) {
        merged.status = rec.status;
        merged.resolvedAt = rec.resolvedAt;
      }
      merged.maxFavorable = Math.max(Number(prev.maxFavorable) || 0, Number(rec.maxFavorable) || 0);
      merged.touchCount = Math.max(Number(prev.touchCount) || 1, Number(rec.touchCount) || 1);
      merged.ceTouched = Boolean(prev.ceTouched || rec.ceTouched);
      merged.lastTouchAt = Math.max(Number(prev.lastTouchAt) || 0, Number(rec.lastTouchAt) || 0) || merged.touchedAt;
      if (prev.source === "LIVE") merged.source = "LIVE";
      poiMap.set(rec.id, merged);
    };

    local.poiRecords.forEach(upsertPoi);
    remote.poiRecords.forEach(upsertPoi);

    const evMap = new Map();
    const upsertEv = (ev) => {
      if (!ev || !ev.id || !Number.isFinite(Number(ev.ts))) return;
      const prev = evMap.get(ev.id);
      if (!prev || (prev.source !== "LIVE" && ev.source === "LIVE")) {
        evMap.set(ev.id, { ...ev });
      }
    };
    local.timelineEvents.forEach(upsertEv);
    remote.timelineEvents.forEach(upsertEv);

    const dailyArchive = { ...local.dailyArchive };
    Object.keys(remote.dailyArchive).forEach((dateKey) => {
      const a = dailyArchive[dateKey];
      const b = remote.dailyArchive[dateKey];
      if (!a) {
        dailyArchive[dateKey] = b;
      } else if ((Number(b.total) || 0) > (Number(a.total) || 0) ||
        ((Number(b.total) || 0) === (Number(a.total) || 0) && (Number(b.resolved) || 0) >= (Number(a.resolved) || 0))) {
        dailyArchive[dateKey] = b;
      }
    });

    return {
      version: 2,
      poiRecords: [...poiMap.values()].sort((a, b) => Number(b.touchedAt) - Number(a.touchedAt)).slice(0, MAPPING_MAX_POI_RECORDS),
      timelineEvents: [...evMap.values()].sort((a, b) => Number(b.ts) - Number(a.ts)).slice(0, MAPPING_MAX_TIMELINE_EVENTS),
      dailyArchive
    };
  }

  function buildSnapshot(payload, meta = {}) {
    const safePayload = payload && typeof payload === "object" ? payload : {};
    const sanitizedJournals = Array.isArray(safePayload.journals)
      ? safePayload.journals.map(sanitizeJournalForCloud).filter(Boolean)
      : [];
    const sanitizedNotes = Array.isArray(safePayload.personalNotes)
      ? stripSecretsDeep(safePayload.personalNotes)
      : [];

    const profileIn = safePayload.profile && typeof safePayload.profile === "object"
      ? safePayload.profile
      : {};

    const cleanPayload = {
      journals: sanitizedJournals,
      personalNotes: sanitizedNotes,
      profile: {
        traderName: String(profileIn.traderName || ""),
        defaultBalance: Number(profileIn.defaultBalance) || 5000,
        defaultRisk: Number(profileIn.defaultRisk) || 1.5,
        accountCurrency: String(profileIn.accountCurrency || "IDR"),
        usdIdrRate: Number(profileIn.usdIdrRate) || 16500,
        accountLeverage: Number(profileIn.accountLeverage) || 500,
        accountSpread: Number.isFinite(Number(profileIn.accountSpread)) ? Number(profileIn.accountSpread) : 0.25,
        simCashflows: Array.isArray(profileIn.simCashflows) ? stripSecretsDeep(profileIn.simCashflows) : [],
        simPositions: Array.isArray(profileIn.simPositions) ? stripSecretsDeep(profileIn.simPositions) : []
      },
      dailyLossGuard: safePayload.dailyLossGuard && typeof safePayload.dailyLossGuard === "object"
        ? stripSecretsDeep(safePayload.dailyLossGuard)
        : {},
      academyProgress: safePayload.academyProgress && typeof safePayload.academyProgress === "object"
        ? stripSecretsDeep(safePayload.academyProgress)
        : {},
      academyBookmarks: Array.isArray(safePayload.academyBookmarks) ? stripSecretsDeep(safePayload.academyBookmarks) : [],
      replayBookmarks: Array.isArray(safePayload.replayBookmarks) ? stripSecretsDeep(safePayload.replayBookmarks) : [],
      mediaWatched: Array.isArray(safePayload.mediaWatched) ? safePayload.mediaWatched.map(String) : [],
      exportedBacktestIds: Array.isArray(safePayload.exportedBacktestIds) ? safePayload.exportedBacktestIds.map(String) : [],
      habits: Array.isArray(safePayload.habits) ? stripSecretsDeep(safePayload.habits) : [],
      completedHabits: safePayload.completedHabits && typeof safePayload.completedHabits === "object"
        ? stripSecretsDeep(safePayload.completedHabits)
        : {},
      mappingReactionHistory: sanitizeMappingHistoryForCloud(safePayload.mappingReactionHistory)
    };

    return {
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      app: "amy-fx-pro",
      updatedAt: meta.updatedAt || new Date().toISOString(),
      deviceId: meta.deviceId || generateDeviceId(),
      payload: cleanPayload
    };
  }

  function validateSnapshot(obj) {
    if (!obj || typeof obj !== "object") {
      return { valid: false, error: "File snapshot Cloud tidak valid." };
    }
    if (obj.app !== "amy-fx-pro" || !obj.payload || typeof obj.payload !== "object") {
      return { valid: false, error: "Format file snapshot bukan milik Amy FX Pro." };
    }
    if (Number(obj.schemaVersion || 0) > SNAPSHOT_SCHEMA_VERSION) {
      return { valid: false, error: "Versi snapshot Cloud lebih baru dari aplikasi saat ini." };
    }
    return { valid: true, error: "" };
  }

  function detectPushConflict({ remoteSnapshot, localDeviceId, lastRemoteUpdatedAt, force = false }) {
    if (force || !remoteSnapshot || typeof remoteSnapshot !== "object") {
      return { conflict: false, reason: "", remoteUpdatedAt: remoteSnapshot?.updatedAt || "", remoteDeviceId: remoteSnapshot?.deviceId || "" };
    }
    const remoteUpdatedAt = String(remoteSnapshot.updatedAt || "");
    const remoteDeviceId = String(remoteSnapshot.deviceId || "");
    const remoteMs = Date.parse(remoteUpdatedAt);
    if (!Number.isFinite(remoteMs)) {
      return { conflict: false, reason: "", remoteUpdatedAt, remoteDeviceId };
    }

    if (remoteDeviceId && localDeviceId && remoteDeviceId === localDeviceId) {
      return { conflict: false, reason: "", remoteUpdatedAt, remoteDeviceId };
    }

    const lastKnownMs = Date.parse(String(lastRemoteUpdatedAt || ""));
    if (!Number.isFinite(lastKnownMs) || remoteMs > lastKnownMs) {
      return {
        conflict: true,
        reason: "Data di GitHub Cloud lebih baru dari perangkat lain.",
        remoteUpdatedAt,
        remoteDeviceId
      };
    }

    return { conflict: false, reason: "", remoteUpdatedAt, remoteDeviceId };
  }

  function defaultOpenDb() {
    if (typeof globalScope.indexedDB === "undefined") return Promise.resolve(null);
    return new Promise((resolve) => {
      try {
        const req = globalScope.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
          if (!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE, { keyPath: "id" });
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (_) {
        resolve(null);
      }
    });
  }

  async function readIdbMetadata(recordId, openDb = defaultOpenDb) {
    let db = null;
    try {
      db = await openDb();
      if (!db || !db.objectStoreNames.contains(META_STORE)) return null;
      return await new Promise((resolve) => {
        const tx = db.transaction(META_STORE, "readonly");
        const req = tx.objectStore(META_STORE).get(recordId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch (_) {
      return null;
    } finally {
      try { db?.close?.(); } catch (_) {}
    }
  }

  async function writeIdbMetadataBatch(records, openDb = defaultOpenDb) {
    let db = null;
    try {
      db = await openDb();
      if (!db || !db.objectStoreNames.contains(META_STORE)) return false;
      return await new Promise((resolve) => {
        const tx = db.transaction(META_STORE, "readwrite");
        const store = tx.objectStore(META_STORE);
        records.forEach((rec) => store.put(rec));
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (_) {
      return false;
    } finally {
      try { db?.close?.(); } catch (_) {}
    }
  }

  async function collectLocalPayload({ storage, openDb } = {}) {
    let journals = null;
    const idbJournals = await readIdbMetadata("journals.v2", openDb);
    if (Array.isArray(idbJournals?.value)) {
      journals = idbJournals.value;
    }
    if (!Array.isArray(journals)) {
      const legacyJ = safeReadJson(storage, "tradingLibraryManager.journals.v1", null);
      if (Array.isArray(legacyJ)) journals = legacyJ;
    }
    if (!Array.isArray(journals)) {
      const altJ = safeReadJson(storage, "amy_journal_entries", []);
      journals = Array.isArray(altJ) ? altJ : [];
    }

    // Personal notes: tradingLibraryManager.notes.v1 is live canonical in Jurnal, fallback to IndexedDB notes.v2
    let personalNotes = safeReadJson(storage, "tradingLibraryManager.notes.v1", null);
    if (!Array.isArray(personalNotes)) {
      const idbNotes = await readIdbMetadata("notes.v2", openDb);
      personalNotes = Array.isArray(idbNotes?.value) ? idbNotes.value : [];
    }

    return {
      journals,
      personalNotes,
      profile: {
        traderName: safeReadString(storage, "amy_trader_name", ""),
        defaultBalance: Number(safeReadString(storage, "amy_default_balance", "5000")) || 5000,
        defaultRisk: Number(safeReadString(storage, "amy_default_risk", "1.5")) || 1.5,
        accountCurrency: safeReadString(storage, "amy_account_currency", "IDR") || "IDR",
        usdIdrRate: Number(safeReadString(storage, "amy_usd_idr_rate", "16500")) || 16500,
        accountLeverage: Number(safeReadString(storage, "amy_account_leverage", "500")) || 500,
        accountSpread: Number.isFinite(Number(safeReadString(storage, "amy_account_spread", "0.25")))
          ? Number(safeReadString(storage, "amy_account_spread", "0.25"))
          : 0.25,
        simCashflows: safeReadJson(storage, "amy_sim_cashflows_v1", []),
        simPositions: safeReadJson(storage, "amy_sim_positions_v1", [])
      },
      dailyLossGuard: safeReadJson(storage, "amy_daily_loss_guard_v1", {}),
      academyProgress: safeReadJson(storage, "amy_academy_progress_v2", {}),
      academyBookmarks: safeReadJson(storage, "amy_academy_bookmarks_v1", []),
      replayBookmarks: safeReadJson(storage, "amy_replay_bookmarks_v1", []),
      mediaWatched: safeReadJson(storage, "amy_media_watched_v1", []),
      exportedBacktestIds: safeReadJson(storage, "amy.backtest.exportedJournalIds.v1", []),
      habits: safeReadJson(storage, "amy_habits_v2", []),
      completedHabits: safeReadJson(storage, "amy_completed_dates_v2", {}),
      mappingReactionHistory: safeReadJson(storage, MAPPING_HISTORY_KEY, null)
    };
  }

  async function applyCloudPayload(payload, { storage, openDb } = {}) {
    const safe = buildSnapshot(payload).payload;

    safeWriteJson(storage, "tradingLibraryManager.journals.v1", safe.journals);
    safeWriteJson(storage, "amy_journal_entries", safe.journals);
    safeWriteJson(storage, "tradingLibraryManager.notes.v1", safe.personalNotes);

    const p = safe.profile;
    if (p.traderName) safeWriteString(storage, "amy_trader_name", p.traderName);
    safeWriteString(storage, "amy_default_balance", p.defaultBalance);
    safeWriteString(storage, "amy_default_risk", p.defaultRisk);
    safeWriteString(storage, "amy_account_currency", p.accountCurrency);
    safeWriteString(storage, "amy_usd_idr_rate", p.usdIdrRate);
    safeWriteString(storage, "amy_account_leverage", p.accountLeverage);
    safeWriteString(storage, "amy_account_spread", p.accountSpread);
    safeWriteJson(storage, "amy_sim_cashflows_v1", p.simCashflows);
    safeWriteJson(storage, "amy_sim_positions_v1", p.simPositions);

    if (safe.dailyLossGuard && Object.keys(safe.dailyLossGuard).length) {
      safeWriteJson(storage, "amy_daily_loss_guard_v1", safe.dailyLossGuard);
    }
    if (safe.academyProgress && Object.keys(safe.academyProgress).length) {
      safeWriteJson(storage, "amy_academy_progress_v2", safe.academyProgress);
    }
    safeWriteJson(storage, "amy_academy_bookmarks_v1", safe.academyBookmarks);
    safeWriteJson(storage, "amy_replay_bookmarks_v1", safe.replayBookmarks);
    safeWriteJson(storage, "amy_media_watched_v1", safe.mediaWatched);
    safeWriteJson(storage, "amy.backtest.exportedJournalIds.v1", safe.exportedBacktestIds);
    if (Array.isArray(safe.habits) && safe.habits.length) {
      safeWriteJson(storage, "amy_habits_v2", safe.habits);
    }
    if (safe.completedHabits && Object.keys(safe.completedHabits).length) {
      safeWriteJson(storage, "amy_completed_dates_v2", safe.completedHabits);
    }

    const remoteMapping = safe.mappingReactionHistory;
    let mergedMappingCount = 0;
    let mergedMappingDays = 0;
    if (
      remoteMapping &&
      (remoteMapping.poiRecords.length > 0 ||
        remoteMapping.timelineEvents.length > 0 ||
        Object.keys(remoteMapping.dailyArchive || {}).length > 0)
    ) {
      const localMapping = safeReadJson(storage, MAPPING_HISTORY_KEY, null);
      const mergedMapping = mergeMappingHistorySnapshots(localMapping, remoteMapping);
      safeWriteJson(storage, MAPPING_HISTORY_KEY, mergedMapping);
      mergedMappingCount = mergedMapping.poiRecords.length;
      mergedMappingDays = Object.keys(mergedMapping.dailyArchive || {}).length;
    }

    const nowIso = new Date().toISOString();
    await writeIdbMetadataBatch([
      { id: "journals.v2", value: safe.journals, updatedAt: nowIso },
      { id: "notes.v2", value: safe.personalNotes, updatedAt: nowIso }
    ], openDb);

    return {
      journalCount: safe.journals.length,
      noteCount: safe.personalNotes.length,
      mappingPoiCount: mergedMappingCount,
      mappingDayCount: mergedMappingDays
    };
  }

  function buildGithubHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION
    };
  }

  function buildContentsUrl(owner, name, filePath, branch) {
    const encodedPath = filePath.split("/").map(encodeURIComponent).join("/");
    const base = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contents/${encodedPath}`;
    return branch ? `${base}?ref=${encodeURIComponent(branch)}` : base;
  }

  function mapGithubError(status, fallbackMsg) {
    if (status === 401) return "Token PAT tidak valid atau sudah kedaluwarsa (401).";
    if (status === 403) return "Izin token kurang. Pastikan izin Contents: Read and write aktif (403).";
    if (status === 404) return "Repositori atau branch tidak ditemukan (404).";
    if (status === 409) return "Terjadi konflik versi di GitHub (409). Ambil dari Cloud dulu lalu coba lagi.";
    if (status === 422) return "Permintaan ditolak GitHub (422). Cek nama branch & file.";
    return fallbackMsg || `Gagal menghubungi GitHub (HTTP ${status || "error"}).`;
  }

  function resolveFetch(fetchImpl) {
    const fn = fetchImpl || globalScope.fetch;
    if (typeof fn !== "function") {
      throw new Error("Fetch API tidak tersedia di lingkungan ini.");
    }
    return fn;
  }

  function emitStatusEvent(type, detail) {
    try {
      if (typeof globalScope.dispatchEvent === "function" && typeof CustomEvent === "function") {
        globalScope.dispatchEvent(new CustomEvent("amyfx:cloud-sync-status", { detail: { type, ...(detail || {}) } }));
      }
    } catch (_) {}
  }

  async function testConnection(configPatch, { fetchImpl, storage } = {}) {
    const merged = configPatch ? saveConfig(configPatch, storage) : loadConfig(storage);
    const repoCheck = parseRepoSlug(merged.repo);
    if (!repoCheck.valid) return { ok: false, error: repoCheck.error };

    const branchCheck = validateBranchName(merged.branch);
    if (!branchCheck.valid) return { ok: false, error: branchCheck.error };

    const fileCheck = validateFilePath(merged.filePath);
    if (!fileCheck.valid) return { ok: false, error: fileCheck.error };

    if (!merged.token) {
      return { ok: false, error: "Tempelkan Token PAT GitHub terlebih dahulu." };
    }

    const doFetch = resolveFetch(fetchImpl);
    const headers = buildGithubHeaders(merged.token);

    try {
      const repoUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(repoCheck.owner)}/${encodeURIComponent(repoCheck.name)}`;
      const repoRes = await doFetch(repoUrl, { method: "GET", headers, cache: "no-store" });
      if (!repoRes.ok) {
        saveConfig({ connected: false, isPrivate: null }, storage);
        return { ok: false, status: repoRes.status, error: mapGithubError(repoRes.status) };
      }
      const repoData = await repoRes.json();
      const isPrivate = Boolean(repoData?.private);

      const branchUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(repoCheck.owner)}/${encodeURIComponent(repoCheck.name)}/branches/${encodeURIComponent(branchCheck.branch)}`;
      const branchRes = await doFetch(branchUrl, { method: "GET", headers, cache: "no-store" });
      if (!branchRes.ok) {
        saveConfig({ connected: false, isPrivate }, storage);
        return {
          ok: false,
          status: branchRes.status,
          isPrivate,
          error: branchRes.status === 404
            ? `Branch "${branchCheck.branch}" belum ada di repo. Buat file README.md di GitHub dulu.`
            : mapGithubError(branchRes.status)
        };
      }

      const updated = saveConfig({
        repo: repoCheck.slug,
        branch: branchCheck.branch,
        filePath: fileCheck.filePath,
        connected: true,
        isPrivate
      }, storage);

      emitStatusEvent("connected", updated);
      return {
        ok: true,
        status: 200,
        repo: repoCheck.slug,
        branch: branchCheck.branch,
        isPrivate,
        defaultBranch: repoData?.default_branch || branchCheck.branch,
        message: isPrivate
          ? "Terhubung ke repo Private GitHub."
          : "Terhubung, namun repo berstatus Publik! Sebaiknya ubah ke Private."
      };
    } catch (err) {
      return {
        ok: false,
        error: "Tidak dapat terhubung ke GitHub. Periksa koneksi internet Anda."
      };
    }
  }

  async function fetchRemoteSnapshot(configInput, { fetchImpl, storage } = {}) {
    const cfg = configInput || loadConfig(storage);
    const repoCheck = parseRepoSlug(cfg.repo);
    if (!repoCheck.valid) return { ok: false, error: repoCheck.error };

    const branchCheck = validateBranchName(cfg.branch);
    if (!branchCheck.valid) return { ok: false, error: branchCheck.error };

    const fileCheck = validateFilePath(cfg.filePath);
    if (!fileCheck.valid) return { ok: false, error: fileCheck.error };

    if (!cfg.token) return { ok: false, error: "Token PAT GitHub belum diisi." };

    const doFetch = resolveFetch(fetchImpl);
    const url = buildContentsUrl(repoCheck.owner, repoCheck.name, fileCheck.filePath, branchCheck.branch);

    try {
      const res = await doFetch(url, {
        method: "GET",
        headers: buildGithubHeaders(cfg.token),
        cache: "no-store"
      });

      if (res.status === 404) {
        return { ok: true, exists: false, sha: null, snapshot: null };
      }
      if (!res.ok) {
        return { ok: false, status: res.status, error: mapGithubError(res.status) };
      }

      const data = await res.json();
      const rawText = decodeBase64Utf8(data?.content || "");
      const snapshot = JSON.parse(rawText);
      const validCheck = validateSnapshot(snapshot);
      if (!validCheck.valid) {
        return { ok: false, error: validCheck.error };
      }

      return {
        ok: true,
        exists: true,
        sha: String(data?.sha || ""),
        snapshot
      };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof SyntaxError
          ? "Isi file snapshot di GitHub bukan JSON yang valid."
          : "Gagal membaca data dari GitHub. Periksa koneksi internet."
      };
    }
  }

  async function pushToCloud({ force = false, reason = "manual", fetchImpl, storage, openDb } = {}) {
    if (syncInFlight) {
      return { ok: false, busy: true, error: "Sinkronisasi sedang berjalan..." };
    }
    const cfg = loadConfig(storage);
    const repoCheck = parseRepoSlug(cfg.repo);
    if (!repoCheck.valid) return { ok: false, error: repoCheck.error };
    const branchCheck = validateBranchName(cfg.branch);
    if (!branchCheck.valid) return { ok: false, error: branchCheck.error };
    const fileCheck = validateFilePath(cfg.filePath);
    if (!fileCheck.valid) return { ok: false, error: fileCheck.error };
    if (!cfg.token) return { ok: false, error: "Token PAT GitHub belum dikonfigurasi." };

    syncInFlight = true;
    emitStatusEvent("syncing", { direction: "push", reason });

    try {
      const remote = await fetchRemoteSnapshot(cfg, { fetchImpl, storage });
      if (!remote.ok) {
        emitStatusEvent("error", { direction: "push", error: remote.error });
        return { ok: false, status: remote.status, error: remote.error };
      }

      if (remote.exists) {
        const conflictCheck = detectPushConflict({
          remoteSnapshot: remote.snapshot,
          localDeviceId: cfg.deviceId,
          lastRemoteUpdatedAt: cfg.lastRemoteUpdatedAt,
          force
        });
        if (conflictCheck.conflict) {
          emitStatusEvent("conflict", conflictCheck);
          return {
            ok: false,
            conflict: true,
            remoteUpdatedAt: conflictCheck.remoteUpdatedAt,
            remoteDeviceId: conflictCheck.remoteDeviceId,
            error: conflictCheck.reason
          };
        }
      }

      const payload = await collectLocalPayload({ storage, openDb });
      const nowIso = new Date().toISOString();
      const snapshot = buildSnapshot(payload, { updatedAt: nowIso, deviceId: cfg.deviceId });
      const encoded = encodeBase64Utf8(JSON.stringify(snapshot, null, 2));

      const body = {
        message: `sync(amyfx): update snapshot ${nowIso}`,
        content: encoded,
        branch: branchCheck.branch
      };
      if (remote.exists && remote.sha) {
        body.sha = remote.sha;
      }

      const doFetch = resolveFetch(fetchImpl);
      const putUrl = buildContentsUrl(repoCheck.owner, repoCheck.name, fileCheck.filePath, "");
      const res = await doFetch(putUrl, {
        method: "PUT",
        headers: {
          ...buildGithubHeaders(cfg.token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errMsg = mapGithubError(res.status);
        emitStatusEvent("error", { direction: "push", error: errMsg });
        return { ok: false, status: res.status, error: errMsg };
      }

      const putData = await res.json();
      const newSha = String(putData?.content?.sha || remote.sha || "");
      const updatedCfg = saveConfig({
        connected: true,
        lastSyncAt: nowIso,
        lastRemoteSha: newSha,
        lastRemoteUpdatedAt: nowIso
      }, storage);

      emitStatusEvent("pushed", {
        ...updatedCfg,
        journalCount: snapshot.payload.journals.length,
        noteCount: snapshot.payload.personalNotes.length
      });

      return {
        ok: true,
        sha: newSha,
        updatedAt: nowIso,
        journalCount: snapshot.payload.journals.length,
        noteCount: snapshot.payload.personalNotes.length
      };
    } catch (_) {
      const errMsg = "Gagal mengirim cadangan ke GitHub. Periksa koneksi internet.";
      emitStatusEvent("error", { direction: "push", error: errMsg });
      return { ok: false, error: errMsg };
    } finally {
      syncInFlight = false;
    }
  }

  async function pullFromCloud({ fetchImpl, storage, openDb } = {}) {
    if (syncInFlight) {
      return { ok: false, busy: true, error: "Sinkronisasi sedang berjalan..." };
    }
    const cfg = loadConfig(storage);
    if (!cfg.token) return { ok: false, error: "Token PAT GitHub belum dikonfigurasi." };

    syncInFlight = true;
    emitStatusEvent("syncing", { direction: "pull" });

    try {
      const remote = await fetchRemoteSnapshot(cfg, { fetchImpl, storage });
      if (!remote.ok) {
        emitStatusEvent("error", { direction: "pull", error: remote.error });
        return { ok: false, status: remote.status, error: remote.error };
      }
      if (!remote.exists || !remote.snapshot) {
        return { ok: false, empty: true, error: "Belum ada file cadangan di Cloud. Kirim ke Cloud dulu dari perangkat ini." };
      }

      const applied = await applyCloudPayload(remote.snapshot.payload, { storage, openDb });
      const nowIso = new Date().toISOString();
      const remoteUpdatedAt = String(remote.snapshot.updatedAt || nowIso);

      const updatedCfg = saveConfig({
        connected: true,
        lastSyncAt: nowIso,
        lastRemoteSha: remote.sha || "",
        lastRemoteUpdatedAt: remoteUpdatedAt
      }, storage);

      emitStatusEvent("pulled", { ...updatedCfg, ...applied });
      try {
        if (typeof globalScope.dispatchEvent === "function" && typeof CustomEvent === "function") {
          globalScope.dispatchEvent(new CustomEvent("amyfx:cloud-sync-pulled", { detail: applied }));
        }
      } catch (_) {}

      return {
        ok: true,
        sha: remote.sha || "",
        remoteUpdatedAt,
        ...applied
      };
    } catch (_) {
      const errMsg = "Gagal mengambil data dari GitHub.";
      emitStatusEvent("error", { direction: "pull", error: errMsg });
      return { ok: false, error: errMsg };
    } finally {
      syncInFlight = false;
    }
  }

  async function checkRemoteUpdate({ fetchImpl, storage } = {}) {
    const cfg = loadConfig(storage);
    if (!cfg.token || !cfg.connected) return { ok: false, hasUpdate: false };
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { ok: false, hasUpdate: false, offline: true };
    }
    const remote = await fetchRemoteSnapshot(cfg, { fetchImpl, storage });
    if (!remote.ok || !remote.exists || !remote.snapshot) {
      return { ok: remote.ok, hasUpdate: false };
    }
    const conflictCheck = detectPushConflict({
      remoteSnapshot: remote.snapshot,
      localDeviceId: cfg.deviceId,
      lastRemoteUpdatedAt: cfg.lastRemoteUpdatedAt,
      force: false
    });
    return {
      ok: true,
      hasUpdate: conflictCheck.conflict,
      remoteUpdatedAt: conflictCheck.remoteUpdatedAt,
      remoteDeviceId: conflictCheck.remoteDeviceId
    };
  }

  function cancelAutoSync() {
    if (autoSyncTimer) {
      clearTimeout(autoSyncTimer);
      autoSyncTimer = null;
    }
  }

  function scheduleAutoSync(source = "local", { delayMs = AUTO_SYNC_DEBOUNCE_MS, fetchImpl, storage, openDb } = {}) {
    const cfg = loadConfig(storage);
    if (!cfg.autoSync || !cfg.token || !cfg.connected) return false;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return false;

    cancelAutoSync();
    autoSyncTimer = setTimeout(() => {
      autoSyncTimer = null;
      pushToCloud({ force: false, reason: `auto:${source}`, fetchImpl, storage, openDb }).catch(() => {});
    }, Math.max(0, Number(delayMs) || 0));
    return true;
  }

  function formatSyncTimestamp(isoString) {
    if (!isoString) return "";
    const ms = Date.parse(isoString);
    if (!Number.isFinite(ms)) return "";
    try {
      const d = new Date(ms);
      const formatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(d);
      return `${formatted.replace(".", ":")} WITA`;
    } catch (_) {
      return isoString.slice(0, 16).replace("T", " ");
    }
  }

  const api = {
    CONFIG_STORAGE_KEY,
    DEFAULT_REPO,
    DEFAULT_BRANCH,
    DEFAULT_FILE_PATH,
    AUTO_SYNC_DEBOUNCE_MS,
    SNAPSHOT_SCHEMA_VERSION,
    parseRepoSlug,
    validateBranchName,
    validateFilePath,
    encodeBase64Utf8,
    decodeBase64Utf8,
    loadConfig,
    saveConfig,
    disconnectConfig,
    sanitizeJournalForCloud,
    sanitizeMappingHistoryForCloud,
    mergeMappingHistorySnapshots,
    buildSnapshot,
    validateSnapshot,
    detectPushConflict,
    collectLocalPayload,
    applyCloudPayload,
    testConnection,
    fetchRemoteSnapshot,
    pushToCloud,
    pullFromCloud,
    checkRemoteUpdate,
    scheduleAutoSync,
    cancelAutoSync,
    formatSyncTimestamp
  };

  globalScope.AmyGitHubSync = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
