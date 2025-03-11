// Import Firebase modules
import { auth, db } from "./firebaseConfig.js";
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp, 
    onSnapshot, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Handle Student Help Request
document.getElementById('help-btn').addEventListener('click', async () => {
    const pcId = document.getElementById('pc-id').value.trim();

    if (pcId === '') {
        alert('Please enter your PC ID!');
        return;
    }

    try {
        await addDoc(collection(db, 'help_requests'), {
            pcId: pcId,
            message: `Student at PC ID: ${pcId} needs help!`,
            timestamp: serverTimestamp()
        });
        alert('Your request has been sent.');
        document.getElementById('pc-id').value = '';
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Failed to send request: ' + error.message);
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
        console.error('Login error:', error.code, error.message);
        alert('Login failed: ' + error.message);
    }
});

// Monitor Admin Login State
onAuthStateChanged(auth, (user) => {
    const loginCard = document.getElementById('admin-login-card');
    const dashboardCard = document.getElementById('admin-dashboard-card');
    if (user) {
        loginCard.classList.add('d-none');
        dashboardCard.classList.remove('d-none');
        getHelpRequests();
    } else {
        loginCard.classList.remove('d-none');
        dashboardCard.classList.add('d-none');
    }
});

// Fetch & Display Help Requests in Real-time
function getHelpRequests() {
    const helpRequestsContainer = document.getElementById('help-requests');

    // Single event listener for all "Helped" buttons
    helpRequestsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('helped-btn')) {
            const requestId = e.target.getAttribute('data-id');
            deleteDoc(doc(db, 'help_requests', requestId)).catch(error => {
                console.error('Error deleting request:', error);
            });
        }
    });

    const q = query(collection(db, 'help_requests'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        helpRequestsContainer.innerHTML = '';
        if (snapshot.empty) {
            helpRequestsContainer.innerHTML = '<p class="text-muted">No new requests yet!</p>';
        } else {
            snapshot.forEach(docSnap => {
                const request = docSnap.data();
                const requestId = docSnap.id;
                const timestamp = request.timestamp;
                const date = timestamp ? new Date(timestamp.seconds * 1000) : new Date();
                const timeString = date.toLocaleTimeString();

                const requestElement = document.createElement('div');
                requestElement.classList.add('alert', 'alert-info', 'd-flex', 'justify-content-between', 'align-items-center');
                requestElement.innerHTML = `
                    <span>${request.message} - ${timeString}</span>
                    <button class="btn btn-sm btn-success helped-btn" data-id="${requestId}">Helped</button>
                `;
                helpRequestsContainer.appendChild(requestElement);
            });
        }
    });
}