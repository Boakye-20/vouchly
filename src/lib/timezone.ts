import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveUserTimezone(userId: string, timezone: string) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, { timezone }, { merge: true });
}

export async function getUserTimezone(userId: string): Promise<string | null> {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data().timezone as string) : null;
}
