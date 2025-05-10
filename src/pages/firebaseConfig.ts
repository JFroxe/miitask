import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcl0NI9xCoUbHlMD-iwFZZJ7D3Hh9YApo",
  authDomain: "mii-task.firebaseapp.com",
  projectId: "mii-task",
  storageBucket: "mii-task.firebasestorage.app",
  messagingSenderId: "80194152063",
  appId: "1:80194152063:web:1f327e0391877673e0c14a",
  measurementId: "G-588FXMZJ45"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
