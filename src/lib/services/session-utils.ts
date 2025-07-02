import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getPartnerTimezone(partnerId: string): Promise<string | null> {
  const userRef = doc(db, "users", partnerId);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data().timezone as string) : null;
}
