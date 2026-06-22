import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { FIREBASE_CONFIG } from './config';

function getAuthInstance() {
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  return getAuth(app);
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
