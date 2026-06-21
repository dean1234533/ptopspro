export const ENQUIRIES_KEY = 'pt_enquiries';
export const PROSPECTS_KEY = 'pt_prospects';
export const OUTREACH_KEY  = 'pt_outreach';
export const SETTINGS_KEY  = 'pt_settings';

const ALL_KEYS   = [ENQUIRIES_KEY, PROSPECTS_KEY, OUTREACH_KEY];
const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

// In-memory cache — populated by initStorage() before React renders
const mem = {};

// Call once before ReactDOM.createRoot so components can read synchronously
export async function initStorage() {
  if (!isElectron) return;
  await Promise.all([
    ...ALL_KEYS.map(async k => { mem[k] = await window.electronAPI.readData(k); }),
    (async () => { mem[SETTINGS_KEY] = await window.electronAPI.readData(SETTINGS_KEY); })(),
  ]);
}

function read(key) {
  if (isElectron) return mem[key] ?? [];
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); }
  catch { return []; }
}

function write(key, data) {
  if (isElectron) {
    mem[key] = data;
    window.electronAPI.writeData(key, data); // async fire-and-forget — near instant
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
  window.dispatchEvent(new CustomEvent('pt_data_updated', { detail: { key } }));
}

// Settings helpers — single object, not an array
export function getSettings() {
  if (isElectron) return mem[SETTINGS_KEY] ?? {};
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}'); }
  catch { return {}; }
}

export function saveSettings(data) {
  if (isElectron) {
    mem[SETTINGS_KEY] = data;
    window.electronAPI.writeData(SETTINGS_KEY, data);
  } else {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  }
  window.dispatchEvent(new CustomEvent('pt_data_updated', { detail: { key: SETTINGS_KEY } }));
}

export function getStored(key)        { return read(key); }
export function setStored(key, data)  { write(key, data); }

export function addRecord(key, record) {
  const entry = { ...record, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  write(key, [entry, ...read(key)]);
  return entry;
}

export function updateRecord(key, id, updates) {
  write(key, read(key).map(r => r.id === id ? { ...r, ...updates } : r));
}

export function deleteRecord(key, id) {
  write(key, read(key).filter(r => r.id !== id));
}
