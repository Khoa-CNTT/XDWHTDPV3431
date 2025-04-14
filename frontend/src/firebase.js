// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth'; 
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZj6zlGXD-oC-nXLJ9idAyLRDBq1e_qys",
  authDomain: "webcharity-d0795.firebaseapp.com",
  projectId: "webcharity-d0795",
  storageBucket: "webcharity-d0795.firebasestorage.app",
  messagingSenderId: "578448191236",
  appId: "1:578448191236:web:9a0c9bd53ed579c25e2a51",
  measurementId: "G-QEDPWFYET7",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); 
const auth = getAuth(app);
const db = getFirestore(app);


export { app, analytics, auth, db, collection, getDocs, addDoc }; // Export để dùng ở các file khác
