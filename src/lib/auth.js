import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './config';

function getApp() {
  return getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
}

function getAuthInstance() {
  return getAuth(getApp());
}

// Returns true if the email has been granted access (exists in the 'authorised' collection)
export async function checkAuthorised(email) {
  const db = getFirestore(getApp());
  const snap = await getDoc(doc(db, 'authorised', email.toLowerCase().trim()));
  return snap.exists();
}

export function onAuthChange(callback) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export async function signUp(email, password) {
  return createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function logIn(email, password) {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export async function logOut() {
  return signOut(getAuthInstance());
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(getAuthInstance(), email);
}
