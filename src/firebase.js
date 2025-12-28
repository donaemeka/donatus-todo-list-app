import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// REPLACE these values with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyBY52uyu6FAIlqf3pOZE0wbNI11H2rs0Vo",
    authDomain: "antigravity-12.firebaseapp.com",
    projectId: "antigravity-12",
    storageBucket: "antigravity-12.firebasestorage.app",
    messagingSenderId: "883431553708",
    appId: "1:883431553708:web:e5a727d337a9c9ee923d09",
    measurementId: "G-Z6YX3BYFVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
