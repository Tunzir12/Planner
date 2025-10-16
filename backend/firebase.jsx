// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBmE9n9WEdH1iOPoYowF5T5PFJ1UvDxVJA',
  authDomain: 'goalgetter-tddd27.firebaseapp.com',
  databaseURL: 'https://goalgetter-tddd27-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'goalgetter-tddd27',
  storageBucket: 'goalgetter-tddd27.firebasestorage.app',
  messagingSenderId: '452788546474',
  appId: '1:452788546474:web:46cbc35f0288f8c19419d3',
  measurementId: 'G-CYYY69S9RV',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const db = getFirestore(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
export default app;
