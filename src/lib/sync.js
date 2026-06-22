import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';
import { getSettings, ENQUIRIES_KEY } from './storage';

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}

let unsubscribe = null;
let knownIds = new Set();

export function startSync(onNew) {
  if (unsubscribe) return;

  const settings = getSettings();
  if (!settings.trainerId) return;

  const db = getDb();
  let isInitialLoad = true;

  unsubscribe = onSnapshot(
    collection(db, 'trainers', settings.trainerId, ENQUIRIES_KEY),
    snapshot => {
      const fresh = [];
      snapshot.docChanges().forEach(change => {
        if (change.type !== 'added') return;
        const row = { id: change.doc.id, ...change.doc.data() };
        if (!knownIds.has(row.id)) {
          knownIds.add(row.id);
          fresh.push(row);
        }
      });
      if (fresh.length && !isInitialLoad) onNew(fresh);
      isInitialLoad = false;
    },
    err => console.error('sync error:', err.code)
  );
}

export function stopSync() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  knownIds.clear();
}
