/* Amy FX Pro — Unified Market Data Provider Error Guard
 * Normalizes upstream provider error payloads (e.g. TwelveData { status: 'error', code, message })
 * so serverless routes never misinterpret an error JSON body as an empty candle list.
 */

export function inspectProviderPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      ok: false,
      code: 502,
      isRateLimited: false,
      message: 'Respon provider market tidak valid'
    };
  }

  const statusText = String(payload.status || '').trim().toLowerCase();
  const codeNum = Number(payload.code);
  const rawMessage = String(payload.message || payload.error || '').trim();
  const isRateLimited = codeNum === 429
    || /429|rate\s*limit|api\s*credits|minute\s*limit/i.test(rawMessage);

  if (statusText === 'error' || (Number.isFinite(codeNum) && codeNum >= 400)) {
    return {
      ok: false,
      code: isRateLimited ? 429 : (Number.isFinite(codeNum) && codeNum >= 400 ? codeNum : 502),
      isRateLimited,
      message: rawMessage || (isRateLimited
        ? 'Batas permintaan provider market tercapai, coba lagi sebentar.'
        : 'Provider data market sedang mengalami gangguan.')
    };
  }

  if (Array.isArray(payload.values) && payload.values.length > 0) {
    return { ok: true, code: 200, isRateLimited: false, message: '' };
  }

  return {
    ok: false,
    code: 204,
    isRateLimited: false,
    message: rawMessage || 'Data candle belum tersedia'
  };
}

export function buildProviderErrorBody(inspected, extra = {}) {
  const code = Number(inspected?.code) || 502;
  const isRateLimited = Boolean(inspected?.isRateLimited || code === 429);
  return {
    status: 'error',
    code,
    rateLimited: isRateLimited,
    error: isRateLimited ? 'rate_limited' : 'provider_error',
    message: inspected?.message || 'Layanan data market sedang tidak tersedia.',
    ...extra
  };
}
