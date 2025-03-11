// Import Firebase modules
import { auth, db } from "./firebaseConfig.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    serverTimestamp, 
    orderBy, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Handle Student Help Request
document.getElementById('help-btn').addEventListener('click', async () => {
    const pcId = document.getElementById('pc-id').value.trim();

    if (pcId === '') {
        alert('Please enter your PC ID!');
        return;
    }

    try {
        // Save the request to Firestore
        await addDoc(collection(db, 'help_requests'), {
            pcId: pcId,
            message: `Student at PC ID: ${pcId} needs help!`,
            timestamp: serverTimestamp(),
        });

        alert('Your request has been sent.');
        document.getElementById('pc-id').value = '';
    } catch (error) {
        console.error('Error submitting request:', error);
    }
});

// Admin Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Monitor Admin Login State
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('admin-login-card').style.display = 'none';
        document.getElementById('admin-dashboard-card').style.display = 'block';
        getHelpRequests(); // Load help requests after login
    } else {
        document.getElementById('admin-login-card').style.display = 'block';
        document.getElementById('admin-dashboard-card').style.display = 'none';
    }
});

// Fetch & Display Help Requests in Real-time
function getHelpRequests() {
    const helpRequestsContainer = document.getElementById('help-requests');

    onSnapshot(collection(db, 'help_requests'), (snapshot) => {
        helpRequestsContainer.innerHTML = ''; // Clear previous requests

        snapshot.forEach(docSnap => {
            const request = docSnap.data();
            const requestId = docSnap.id;

            const requestElement = document.createElement('div');
            requestElement.classList.add('alert', 'alert-info', 'd-flex', 'justify-content-between', 'align-items-center');
            requestElement.innerHTML = `
                <span>${request.message}</span>
                <button class="btn btn-sm btn-success helped-btn" data-id="${requestId}">Helped</button>
            `;
            helpRequestsContainer.appendChild(requestElement);
        });

        // Attach event listeners to "Helped" buttons
        document.querySelectorAll('.helped-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const requestId = button.getAttribute('data-id');
                try {
                    await deleteDoc(doc(db, 'help_requests', requestId));
                } catch (error) {
                    console.error('Error deleting request:', error);
                }
            });
        });
    });
}