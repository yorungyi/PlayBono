import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getRemoteConfig, fetchAndActivate, getValue } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export function getFirebaseApp() {
  if (!getApps().length) initializeApp(firebaseConfig);
  return getApps()[0]!;
}

export const auth = getAuth(getFirebaseApp());
export const db = getFirestore(getFirebaseApp());

export async function ensureAnonAuth(): Promise<User> {
  const current = auth.currentUser;
  if (current) return current;

  // Wait briefly for any existing auth state to resolve
  const existing = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
  if (existing) return existing;

  const cred = await signInAnonymously(auth);
  return cred.user;
}

// Remote Config (client only)
export async function getRcNumber(key: string, fallback: number): Promise<number> {
  try {
    const rc = getRemoteConfig(getFirebaseApp());
    rc.settings.minimumFetchIntervalMillis = 60_000; // 1 min in dev; increase in prod
    await fetchAndActivate(rc);
    const v = getValue(rc, key);
    const n = Number(v.asString());
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export async function getRcBool(key: string, fallback: boolean): Promise<boolean> {
  try {
    const rc = getRemoteConfig(getFirebaseApp());
    rc.settings.minimumFetchIntervalMillis = 60_000;
    await fetchAndActivate(rc);
    const v = getValue(rc, key);
    const s = v.asString().toLowerCase();
    if (s === "true") return true;
    if (s === "false") return false;
    return fallback;
  } catch {
    return fallback;
  }
}
