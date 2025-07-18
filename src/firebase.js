// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA4SMHHzx4DqPtsn6xoctIb_Crr0-v7yNw",
  authDomain: "syncwise-91198.firebaseapp.com",
  projectId: "syncwise-91198",
  storageBucket: "syncwise-91198.firebasestorage.app",
  messagingSenderId: "694353500600",
  appId: "1:694353500600:web:1181d8f144be015545974d",
  measurementId: "G-Q79BPWWGK1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);    
