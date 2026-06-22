import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

export const ENQUIRIES_KEY = 'enquiries';
export const PROSPECTS_KEY = 'prospects';
export const OUTREACH_KEY  = 'outreach';
export const SETTINGS_KEY  = 'settings';

const LOCAL_ID_KEY = 'pt_trainer_id';

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}

// In-memory cache — populated by onSnapshot listeners
const cache = {
  [ENQUIRIES_KEY]: [],
  [PROSPECTS_KEY]: [],
  [OUTREACH_KEY]:  [],
  [SETTINGS_KEY]:  {},
};

const unsubs = [];

function dispatch(key) {
  window.dispatchEvent(new CustomEvent('pt_data_updated', { detail: { key } }));
}

function getTrainerId() {
  return localStorage.getItem(LOCAL_ID_KEY) || null;
}

// ── Public: read ──────────────────────────────────────────────────────────────

export function getStored(key) {
  return cache[key] ?? [];
}

export function getSettings() {
  const trainerId = getTrainerId();
  if (!trainerId) return {};
  return { ...cache[SETTINGS_KEY], trainerId };
}

// ── Public: init ──────────────────────────────────────────────────────────────

export function initFirebaseStorage() {
  const trainerId = getTrainerId();
  if (!trainerId) return;

  const db = getDb();

  // Settings doc
  unsubs.push(
    onSnapshot(doc(db, 'trainers', trainerId), snap => {
      cache[SETTINGS_KEY] = snap.exists() ? snap.data() : {};
      dispatch(SETTINGS_KEY);
    })
  );

  // Subcollections
  [ENQUIRIES_KEY, PROSPECTS_KEY, OUTREACH_KEY].forEach(col => {
    unsubs.push(
      onSnapshot(collection(db, 'trainers', trainerId, col), snap => {
        cache[col] = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt ?? '') > (a.createdAt ?? '') ? 1 : -1);
        dispatch(col);
      })
    );
  });
}

export function stopFirebaseStorage() {
  unsubs.forEach(u => u());
  unsubs.length = 0;
}

// ── Public: settings ──────────────────────────────────────────────────────────

export function saveSettings(data) {
  let trainerId = data.trainerId;
  if (!trainerId) {
    trainerId = crypto.randomUUID();
    data = { ...data, trainerId };
  }

  localStorage.setItem(LOCAL_ID_KEY, trainerId);

  // Store everything except trainerId in the Firebase doc
  const { trainerId: _id, ...fields } = data;
  const db = getDb();
  setDoc(doc(db, 'trainers', trainerId), fields, { merge: true });

  // Update cache immediately so UI reflects the save
  cache[SETTINGS_KEY] = fields;
  dispatch(SETTINGS_KEY);

  // Start listeners if this is first-time setup
  if (unsubs.length === 0) initFirebaseStorage();
}

// ── Public: CRUD ──────────────────────────────────────────────────────────────

export async function addRecord(key, record) {
  const trainerId = getTrainerId();
  if (!trainerId) return;
  const entry = { ...record, createdAt: new Date().toISOString() };
  const db = getDb();
  await addDoc(collection(db, 'trainers', trainerId, key), entry);
}

export function updateRecord(key, id, updates) {
  const trainerId = getTrainerId();
  if (!trainerId) return;
  const db = getDb();
  updateDoc(doc(db, 'trainers', trainerId, key, id), updates);
}

export function deleteRecord(key, id) {
  const trainerId = getTrainerId();
  if (!trainerId) return;
  const db = getDb();
  deleteDoc(doc(db, 'trainers', trainerId, key, id));
}

// Kept for Electron compat — no-op on web
export async function initStorage() {}
export function setStored() {}
