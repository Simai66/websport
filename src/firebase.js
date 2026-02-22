import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDyH04HjZsKpA5pZrjXscb0p8GGajV1kEQ",
    authDomain: "websport-booking.firebaseapp.com",
    projectId: "websport-booking",
    storageBucket: "websport-booking.firebasestorage.app",
    messagingSenderId: "295380294984",
    appId: "1:295380294984:web:a5ae504ffc304e3020e77d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
