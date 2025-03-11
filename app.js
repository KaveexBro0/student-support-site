// Import Firebase modules
import { auth, db } from "./firebaseConfig.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
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
    orderBy,
    getDocs 
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
        const now = new Date().toLocaleTimeString();
        const statusDiv = document.getElementById('request-status');
        statusDiv.textContent = `Request submitted at ${now}`;
        statusDiv.style.display = 'block';
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000); // Hide after 5 seconds
        document.getElementById('pc-id').value = '';
    } catch (error) {
        console.error('Error submitting request:', error.code, error.message);
        alert('Failed to send request: ' + error.message);
    }
});

// Admin Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (email === '' || password === '') {
        alert('Please enter both email and password!');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
    } catch (error) {
        console.error('Login error:', error.code, error.message);
        alert(`Login failed: ${error.message} (Code: ${error.code})`);
    }
});

// Admin Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
});

// Clear All Requests
document.getElementById('clear-all-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear all requests?')) {
        try {
            const querySnapshot = await getDocs(collection(db, 'help_requests'));
            const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log('All requests cleared');
        } catch (error) {
            console.error('Error clearing requests:', error);
            alert('Failed to clear requests: ' + error.message);
        }
    }
});

// Monitor Admin Login State
let unsubscribe = null; // Store the snapshot listener for cleanup
onAuthStateChanged(auth, (user) => {
    const loginCard = document.getElementById('admin-login-card');
    const dashboardCard = document.getElementById('admin-dashboard-card');
    if (user) {
        loginCard.classList.add('d-none');
        dashboardCard.classList.remove('d-none');
        if (!unsubscribe) { // Only start listener if not already running
            unsubscribe = getHelpRequests();
        }
    } else {
        loginCard.classList.remove('d-none');
        dashboardCard.classList.add('d-none');
        if (unsubscribe) { // Cleanup listener on logout
            unsubscribe();
            unsubscribe = null;
            document.getElementById('help-requests').innerHTML = ''; // Clear on logout
        }
    }
});

// Fetch & Display Help Requests in Real-time
function getHelpRequests() {
    const helpRequestsContainer = document.getElementById('help-requests');
    const displayedRequests = new Set(); // Track rendered request IDs

    // Single event listener for "Helped" buttons
    helpRequestsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('helped-btn')) {
            const requestId = e.target.getAttribute('data-id');
            deleteDoc(doc(db, 'help_requests', requestId)).catch(error => {
                console.error('Error deleting request:', error);
            });
        }
    });

    const q = query(collection(db, 'help_requests'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        helpRequestsContainer.innerHTML = ''; // Clear and re-render all requests
        if (snapshot.empty) {
            helpRequestsContainer.innerHTML = '<p class="text-muted">No new requests yet!</p>';
            displayedRequests.clear();
        } else {
            snapshot.forEach((docSnap) => {
                const requestId = docSnap.id;
                const request = docSnap.data();
                const timestamp = request.timestamp;
                const date = timestamp ? new Date(timestamp.seconds * 1000) : new Date();
                const timeString = date.toLocaleTimeString();

                const requestElement = document.createElement('div');
                requestElement.classList.add('alert', 'alert-info', 'd-flex', 'justify-content-between', 'align-items-center');
                requestElement.setAttribute('data-request-id', requestId);
                
                // Apply slide-in only for new requests
                if (!displayedRequests.has(requestId)) {
                    requestElement.classList.add('slide-in');
                }

                requestElement.innerHTML = `
                    <span>${request.message} - ${timeString}</span>
                    <button class="btn btn-sm btn-success helped-btn" data-id="${requestId}">Helped</button>
                `;
                helpRequestsContainer.appendChild(requestElement);
                displayedRequests.add(requestId);
            });
        }
    });
}