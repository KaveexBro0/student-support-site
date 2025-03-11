// Firebase setup (Ensure firebaseConfig.js contains correct configuration)
const db = firebase.firestore();
const auth = firebase.auth();

// Handle Student Help Request
document.getElementById('help-btn').addEventListener('click', async () => {
    const pcId = document.getElementById('pc-id').value.trim();

    if (pcId === '') {
        alert('Please enter your PC ID!');
        return;
    }

    // Save the request to Firestore
    await db.collection('help_requests').add({
        pcId: pcId,
        message: `Student at PC ID: ${pcId} needs help!`,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    alert('Your request has been sent.');
    document.getElementById('pc-id').value = '';
});

// Admin Login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('admin-login-card').style.display = 'none';
        document.getElementById('admin-dashboard-card').style.display = 'block';
        getHelpRequests(); // Load help requests after login
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Fetch & Display Help Requests in Real-time
function getHelpRequests() {
    db.collection('help_requests')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            const helpRequests = document.getElementById('help-requests');
            helpRequests.innerHTML = ''; // Clear previous requests

            snapshot.forEach(doc => {
                const request = doc.data();
                const requestId = doc.id;

                helpRequests.innerHTML += `
                    <div class="alert alert-info d-flex justify-content-between align-items-center">
                        <span>${request.message}</span>
                        <button class="btn btn-sm btn-success helped-btn" data-id="${requestId}">Helped</button>
                    </div>
                `;
            });

            // Handle 'Helped' button click
            document.querySelectorAll('.helped-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const requestId = button.getAttribute('data-id');
                    await db.collection('help_requests').doc(requestId).delete();
                });
            });
        });
}