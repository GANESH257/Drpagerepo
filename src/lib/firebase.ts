import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export { app, db };
