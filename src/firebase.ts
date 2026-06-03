import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

let db: any = null;
try {
  if (firebaseConfig && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Firestore client successfully initialized!");
  }
} catch (e) {
  console.warn("Client-side Firebase lazy initialization omitted/failed:", e);
}

export { db };
