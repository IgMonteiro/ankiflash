// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAMZ50mIorZiwEGXylPXmExYF-lKG_tDuA',
  authDomain: 'anki-flash.firebaseapp.com',
  projectId: 'anki-flash',
  storageBucket: 'anki-flash.appspot.com',
  messagingSenderId: '1083777791843',
  appId: '1:1083777791843:web:5301c945ce0bcdcdfc4556',
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

// Inicializa o Auth
const auth = getAuth(app);

// Variável para armazenar o usuário atual
let currentUser = null;

// Listener para o usuário autenticado
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

// Exporta Firestore, Auth e currentUser
export { db, auth, currentUser };
export default app;
