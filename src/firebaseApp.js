import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

//saját Firebase App példány, ezzel érjük el az összes szolgáltatást
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)//ez az objektum felel a Google-s login
export const db=getFirestore(app)//Firestore adatbázis inicializálása