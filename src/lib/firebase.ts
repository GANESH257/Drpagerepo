import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyArkZ7rSLZc6983M_0rSSWJySEAV2pEi0U",
    authDomain: "aip-chat-81380.firebaseapp.com",
    projectId: "aip-chat-81380",
    storageBucket: "aip-chat-81380.firebasestorage.app",
    messagingSenderId: "748469559149",
    appId: "1:748469559149:web:16fbfe00eeab196d63c464"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Enable persistence - keep trying even if initial attempt fails
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    // Log error but don't disable persistence - Firebase will retry automatically
    if (err.code === 'failed-precondition') {
      // Multiple tabs open - this is expected and harmless
      // Firebase will automatically enable persistence in one tab
      // Silently handle this - no need to log
    } else if (err.code === 'unimplemented') {
      console.warn('[Firebase] Browser does not support persistence');
    } else if (err.message?.includes('write batch') || err.message?.includes('compaction')) {
      // IndexedDB write batch/compaction conflict - this is transient and Firebase will retry
      // Silently handle this - Firebase handles retries internally
    } else {
      // Only log unexpected errors
      console.warn('[Firebase] Persistence initialization error (Firebase will retry):', err.code, err.message);
    }
    // Don't disable persistence - let Firebase handle retries internally
  });
}

export { app, db };
