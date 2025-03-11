// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOuzNyKhbwGO0yp26AZggx0L5TZ7xI58Q",
  authDomain: "dpcoding-ab108.firebaseapp.com",
  databaseURL: "https://dpcoding-ab108-default-rtdb.firebaseio.com",
  projectId: "dpcoding-ab108",
  storageBucket: "dpcoding-ab108.firebasestorage.app",
  messagingSenderId: "377248433576",
  appId: "1:377248433576:web:c8ceece84ab022ba71499d",
  measurementId: "G-GYWD7YL0YD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase instances
export { auth, db };