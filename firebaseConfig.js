// firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSyBOuzNyKhbwGO0yp26AZggx0L5TZ7xI58Q",
  authDomain: "dpcoding-ab108.firebaseapp.com",
  projectId: "dpcoding-ab108",
  storageBucket: "dpcoding-ab108.firebasestorage.app",
  messagingSenderId: "377248433576",
  appId: "1:377248433576:web:c8ceece84ab022ba71499d",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();