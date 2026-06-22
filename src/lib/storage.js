import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, query, where, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

export const ENQUIRIES_KEY = 'enquiries';
export const PROSPECTS_KEY = 'prospects';
export const OUTREACH_KEY  = 'outreach';
export const SETTINGS_KEY  = 'settings';

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}

const cache = {
  [ENQUIRIES_KEY]: [],
  [PROSPECTS_KEY]: [],
  [OUTREACH_KEY]:  [],
  [SETTINGS_KEY]:  {},
};

const unsubs = [];
let _trainerId = null;

function dispatch(key) {
  window.dispatchEvent(new CustomEvent('pt_data_updated', { detail: { key } }));
}

// ── Public: read ──────────────────────────────────────────────────────────────

export function getStored(key) { return cache[key] ?? []; }

export function getSettings() {
  if (!_trainerId) return {};
  return { ...cache[SETTINGS_KEY], trainerId: _trainerId };
}

// ── Public: init ──────────────────────────────────────────────────────────────

async function deleteOldRecords(db, trainerId) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 3);
  const cutoffStr = cutoff.toISOString();
  for (const col of [ENQUIRIES_KEY, PROSPECTS_KEY, OUTREACH_KEY]) {
    try {
      const snap = await getDocs(query(collection(db, 'trainers', trainerId, col), where('createdAt', '<', cutoffStr)));
      snap.forEach(d => deleteDoc(d.ref));
    } catch { /* index may not exist yet */ }
  }
}

export function initFirebaseStorage(uid) {
  if (!uid || _trainerId === uid) return;
  _trainerId = uid;

  // Tear down any old listeners (e.g. if user switched accounts)
  stopFirebaseStorage(false);

  const db = getDb();
  deleteOldRecords(db, uid);

  unsubs.push(
    onSnapshot(
      doc(db, 'trainers', uid),
      snap => { cache[SETTINGS_KEY] = snap.exists() ? snap.data() : {}; dispatch(SETTINGS_KEY); },
      err => console.error('settings error:', err.code)
    )
  );

  [ENQUIRIES_KEY, PROSPECTS_KEY, OUTREACH_KEY].forEach(col => {
    unsubs.push(
      onSnapshot(
        collection(db, 'trainers', uid, col),
        snap => {
          cache[col] = snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1);
          dispatch(col);
        },
        err => console.error(`${col} error:`, err.code)
      )
    );
  });
}

export function stopFirebaseStorage(clearId = true) {
  unsubs.forEach(u => u());
  unsubs.length = 0;
  if (clearId) _trainerId = null;
  Object.assign(cache, { [ENQUIRIES_KEY]: [], [PROSPECTS_KEY]: [], [OUTREACH_KEY]: [], [SETTINGS_KEY]: {} });
}

// ── Public: settings ──────────────────────────────────────────────────────────

export function saveSettings(data) {
  if (!_trainerId) return;
  const { trainerId: _id, ...fields } = data;
  setDoc(doc(getDb(), 'trainers', _trainerId), fields, { merge: true });
  cache[SETTINGS_KEY] = fields;
  dispatch(SETTINGS_KEY);
}

// ── Public: CRUD ──────────────────────────────────────────────────────────────

export async function addRecord(key, record) {
  if (!_trainerId) return;
  await addDoc(collection(getDb(), 'trainers', _trainerId, key), { ...record, createdAt: new Date().toISOString() });
}

export function updateRecord(key, id, updates) {
  if (!_trainerId) return;
  updateDoc(doc(getDb(), 'trainers', _trainerId, key, id), updates);
}

export function deleteRecord(key, id) {
  if (!_trainerId) return;
  deleteDoc(doc(getDb(), 'trainers', _trainerId, key, id));
}

export async function initStorage() {}
export function setStored() {}
