import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { env } from "./env.js";

const initializeFirebaseAdmin = () => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp({
        credential: cert(serviceAccount),
        databaseURL: env.FIREBASE_DATABASE_URL,
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON. Initializing with default credentials.", error);
    }
  }

  const projectId = env.FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      databaseURL: env.FIREBASE_DATABASE_URL,
    });
  }

  // Fallback: attempt initialization using default credentials (e.g., GCP Metadata Server or GOOGLE_APPLICATION_CREDENTIALS)
  try {
    return initializeApp({
      databaseURL: env.FIREBASE_DATABASE_URL,
    });
  } catch (error) {
    console.warn("Firebase Admin initialized but might fail at runtime if authentication credentials are not provided:", error.message);
    return initializeApp();
  }
};

const adminApp = initializeFirebaseAdmin();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminMessaging = getMessaging(adminApp);
export const adminStorage = getStorage(adminApp);

export default adminApp;
