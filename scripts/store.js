export const readStore = (key, fallback = null) => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
};
export const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
export const removeStore = (key) => localStorage.removeItem(key);
