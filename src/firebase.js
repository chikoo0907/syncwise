// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyA4SMHHzx4DqPtsn6xoctIb_Crr0-v7yNw",
  authDomain: "syncwise-91198.firebaseapp.com",
  projectId: "syncwise-91198",
  storageBucket: "syncwise-91198.firebasestorage.app",
  messagingSenderId: "694353500600",
  appId: "1:694353500600:web:1181d8f144be015545974d",
  measurementId: "G-Q79BPWWGK1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);    