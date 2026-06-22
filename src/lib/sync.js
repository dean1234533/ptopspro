import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';
import { addRecord, getStored, getSettings, ENQUIRIES_KEY } from './storage';

function getDb() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getFirestore(app);
}

let unsubscribe = null;

export function startSync(onNew) {
  if (unsubscribe) return;

  const settings = getSettings();
  if (!settings.trainerId) return;

  const db = getDb();
  const q  = query(
    collection(db, 'enquiries'),
    where('trainer_id', '==', settings.trainerId),
  );

  let isInitialLoad = true;

  unsubscribe = onSnapshot(
    q,
    snapshot => {
      const existing = getStored(ENQUIRIES_KEY);
      const fresh = [];

      snapshot.docChanges().forEach(change => {
        if (change.type !== 'added') return;
        const row = { id: change.doc.id, ...change.doc.data() };

        // Skip if already saved locally
        if (existing.some(e => e.sourceId === row.id)) return;

        addRecord(ENQUIRIES_KEY, {
          name:         row.name         || '',
          phone:        row.phone        || '',
          email:        row.email        || '',
          goal:         row.goal         || '',
          availability: row.availability || [],
          message:      row.notes        || '',
          status:       'new',
          sourceId:     row.id,
        });

        fresh.push(row);
      });

      // On initial load: silently sync any missed records, no notification
      // On subsequent changes: fire notification for truly new submissions
      if (fresh.length && !isInitialLoad) onNew(fresh);
      isInitialLoad = false;
    },
    err => {
      console.error('Firestore sync error:', err.code, err.message);
    },
  );
}

export function stopSync() {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
}
