import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js"; // Add this

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app); // Initialize messaging

export { auth, db, messaging }; // Export messaging