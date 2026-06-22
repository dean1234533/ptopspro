import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';
import { getSettings, ENQUIRIES_KEY } from './storage';

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
      const fresh = [];

      snapshot.docChanges().forEach(change => {
        if (change.type !== 'added') return;
        const row = { id: change.doc.id, ...change.doc.data() };

        // Use original doc ID so setDoc is idempotent — no duplicates
        setDoc(
          doc(db, 'trainers', settings.trainerId, ENQUIRIES_KEY, row.id),
          {
            name:         row.name         || '',
            phone:        row.phone        || '',
            email:        row.email        || '',
            goal:         row.goal         || '',
            availability: row.availability || [],
            message:      row.notes        || '',
            status:       'new',
            sourceId:     row.id,
            createdAt:    new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});

        fresh.push(row);
      });

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
