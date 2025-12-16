// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBbZQI55kwF7_Eqi_FRRShMwlPee4v8TMA",
    authDomain: "icsp-66c99.firebaseapp.com",
    projectId: "icsp-66c99",
    storageBucket: "icsp-66c99.firebasestorage.app",
    messagingSenderId: "531064323604",
    appId: "1:531064323604:web:58bc0b484b6c4b37e1b101",
    measurementId: "G-97HQDDN136"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
