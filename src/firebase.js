// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA4SMHHzx4DqPtsn6xoctIb_Crr0-v7yNw",
  authDomain: "syncwise-91198.firebaseapp.com",
  projectId: "syncwise-91198",
  storageBucket: "syncwise-91198.firebasestorage.app",
  messagingSenderId: "694353500600",
  appId: "1:694353500600:web:1181d8f144be015545974d",
  measurementId: "G-Q79BPWWGK1",
  databaseURL: "https://syncwise-91198-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

// Test Realtime Database connection
export const testRealtimeConnection = async () => {
  try {
    console.log('Testing Realtime Database connection...');
    console.log('Database URL:', firebaseConfig.databaseURL);
    
    const testRef = ref(realtimeDb, 'connection-test');
    console.log('Test reference created:', testRef.toString());
    
    const testData = { timestamp: Date.now(), test: true };
    await set(testRef, testData);
    console.log('Test data written successfully');
    
    const snapshot = await get(testRef);
    console.log('Test data read successfully:', snapshot.val());
    
    if (snapshot.exists()) {
      console.log('Realtime Database connection successful');
      return true;
    } else {
      console.log('Realtime Database connection failed: snapshot does not exist');
      return false;
    }
  } catch (error) {
    console.error('Realtime Database connection failed with error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific permission errors
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied - Database rules need to be updated');
      console.error('Please update your Realtime Database rules to allow read/write access');
    }
    
    return false;
  }
};    
