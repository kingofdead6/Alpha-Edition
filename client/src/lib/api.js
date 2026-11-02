const BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;
const TOKEN_KEY = 'alfa-token';

let token = null;
try {
  token = localStorage.getItem(TOKEN_KEY);
} catch {
  /* storage blocked */
}

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export function setToken(value) {
  token = value || null;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked */
  }
}
export const getToken = () => token;

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details || [];
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('network', 0, 'network');
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    throw new ApiError(data?.message || res.statusText, res.status, data?.code || 'server', data?.details);
  }
  return data;
}

/** Turns an ApiError into a sentence in the current language */
export function errorText(err, t) {
  if (!err) return '';
  const known = err.code && t(`errors.${err.code}`);
  if (known && known !== `errors.${err.code}`) return known;
  return err.message || t('errors.server');
}

/** Maps server validation details to { 'title.en': 'Required', … } */
export function fieldErrors(err, t) {
  const out = {};
  (err?.details || []).forEach((d) => {
    const msg =
      d.code === 'too_big' ? t('errors.tooLong')
        : d.code === 'too_small' || d.code === 'invalid_type' || d.code === 'custom' ? t('errors.required')
          : d.code === 'duplicate' ? t('errors.duplicate')
            : t('errors.invalid');
    out[d.path] = msg;
    // "title" refinement errors belong to both language inputs
    if (d.code === 'custom') { out[`${d.path}.en`] = msg; }
  });
  return out;
}
