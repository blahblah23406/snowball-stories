import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
