import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7BNTEYOaEQpPmudgMuDVfsejROQE3mXQ",
  authDomain: "portfolio-6a1ed.firebaseapp.com",
  databaseURL: "https://portfolio-6a1ed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-6a1ed",
  storageBucket: "portfolio-6a1ed.appspot.com",
  messagingSenderId: "947551104919",
  appId: "1:947551104919:web:9912d0435577cbb3c49ed2",
  measurementId: "G-V054RG6ZX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getFirestore(app)

