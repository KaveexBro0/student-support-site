// Import Firebase modules
import { auth, db, messaging } from "./firebaseConfig.js";
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
import { getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging.js";

// Dark Mode Toggle
const toggleButton = document.getElementById('dark-mode-toggle');
const themeDebug = document.getElementById('theme-debug');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
toggleButton.textContent = currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
themeDebug.textContent = `Current Theme: ${currentTheme}`;
themeDebug.style.display = 'block';

toggleButton.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    toggleButton.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    themeDebug.textContent = `Current Theme: ${newTheme}`;
    console.log(`Switched to ${newTheme} mode`);
});

// Initialize Notification Sound
const notificationSound = new Audio('https://github.com/KaveexBro0/student-support-site/raw/main/notification-2-269292.mp3');
notificationSound.volume = 0.5;

// Unlock audio on first interaction
let isAudioUnlocked = false;
document.body.addEventListener('click', () => {
    if (!isAudioUnlocked) {
        notificationSound.play().then(() => {
            notificationSound.pause();
            notificationSound.currentTime = 0;
            isAudioUnlocked = true;
            console.log('Audio unlocked for mobile');
        }).catch(error => console.log('Initial audio unlock failed:', error));
    }
}, { once: true });

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
        setTimeout(() => statusDiv.style.display = 'none', 5000);
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

    if (email === '' || password === '') {
        alert('Please enter both email and password!');
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert('Login successful!');
    } catch (error) {
        console.error('Login error:', error);
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

// Request Notification Permission and Get Token
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, { 
                vapidKey: 'BN8_pjYV0tMuk9e6QFHGWYAkfsFSvy4IZvu6_WeNnu4UQOoo6eh8EHx_4UyOiEgixb-emTP8RGLgEpa31C27XFM' 
            });
            console.log('Notification token:', token);
            await addDoc(collection(db, 'admin_tokens'), { token, userId: auth.currentUser.uid });
        }
    } catch (error) {
        console.error('Error getting notification permission:', error);
    }
}

// Monitor Admin Login State
let unsubscribe = null;
onAuthStateChanged(auth, (user) => {
    const loginCard = document.getElementById('admin-login-card');
    const dashboardCard = document.getElementById('admin-dashboard-card');
    if (user) {
        loginCard.classList.add('d-none');
        dashboardCard.classList.remove('d-none');
        if (!unsubscribe) {
            unsubscribe = getHelpRequests();
            requestNotificationPermission();
        }
    } else {
        loginCard.classList.remove('d-none');
        dashboardCard.classList.add('d-none');
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
            document.getElementById('help-requests').innerHTML = '';
            document.getElementById('notifications-container').innerHTML = '';
        }
    }
});

// Show In-App Notification
function showNotification(message, timestamp) {
    const notificationsContainer = document.getElementById('notifications-container');
    const notificationId = `notification-${Date.now()}`;
    const date = timestamp ? new Date(timestamp.seconds * 1000) : new Date();
    const timeString = date.toLocaleTimeString();

    const notification = document.createElement('div');
    notification.classList.add('notification', 'p-2', 'mb-2', 'slide-down');
    notification.id = notificationId;
    notification.innerHTML = `<span>${message} - ${timeString}</span>`;
    notificationsContainer.prepend(notification);

    setTimeout(() => {
        notification.classList.remove('slide-down');
        notification.classList.add('slide-up');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Send Push Notification to Admin
async function sendPushNotification(message, timeString) {
    const adminTokensSnapshot = await getDocs(collection(db, 'admin_tokens'));
    const tokens = adminTokensSnapshot.docs.map(doc => doc.data().token);

    if (tokens.length === 0) return;

    const payload = {
        notification: {
            title: 'New Help Request',
            body: `${message} - ${timeString}`
        }
    };

    tokens.forEach(token => {
        fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Authorization': 'key=YOUR_SERVER_KEY_HERE', // Replace with your Server Key
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: token,
                ...payload
            })
        }).catch(error => console.error('Error sending push notification:', error));
    });
}

// Fetch & Display Help Requests in Real-time
function getHelpRequests() {
    const helpRequestsContainer = document.getElementById('help-requests');
    const displayedRequests = new Set();

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
        helpRequestsContainer.innerHTML = '';
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
                
                if (!displayedRequests.has(requestId)) {
                    requestElement.classList.add('slide-in');
                    showNotification(request.message, timestamp);
                    sendPushNotification(request.message, timeString);
                    if (isAudioUnlocked) {
                        notificationSound.play().catch(error => {
                            console.log('Audio playback failed:', error);
                        });
                    }
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