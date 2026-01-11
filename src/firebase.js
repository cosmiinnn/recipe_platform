import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5R1ZHGaDBSQD7Qq8oL8ERIVMh3DHI-XQ",
  authDomain: "recipe-platform-dsw.firebaseapp.com",
  projectId: "recipe-platform-dsw",
  storageBucket: "recipe-platform-dsw.firebasestorage.app",
  messagingSenderId: "552250922695",
  appId: "1:552250922695:web:fd22d7196c1ad31ab450e2",
  measurementId: "G-N43FG9FMC2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);