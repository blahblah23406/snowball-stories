import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithRedirect, 
    onAuthStateChanged 
} from 'firebase/auth';
import { 
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    deleteDoc 
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCZ9Eia_8WUjVwHeLO-2CwOSketMB_Cwhs",
    authDomain: "snowball-stories.firebaseapp.com",
    projectId: "snowball-stories",
    storageBucket: "snowball-stories.appspot.com",
    messagingSenderId: "874662831073",
    appId: "1:874662831073:web:8ed4031c527b263a0568a0",
    measurementId: "G-XR3N6JDFZK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Encapsulated Firebase exports for streamlined testing and isolation
export {
    signInWithRedirect,
    onAuthStateChanged,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc,
    deleteDoc
};

export default app;
