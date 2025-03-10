document.getElementById('help-btn').addEventListener('click', function() {
    const pcId = document.getElementById('pc-id').value;

    // Validate PC ID
    if (pcId === '') {
        alert('Please enter your PC ID!');
        return;
    }

    // Create a message for the admin
    const message = `Student at PC ID: ${pcId} needs help!`;

    // Show the message in the admin dashboard
    const helpRequests = document.getElementById('help-requests');
    helpRequests.innerHTML = `<p>${message}</p><button id="helped-btn">Helped</button>`;

    // Show the admin section (for the prefect to see)
    document.getElementById('admin-section').style.display = 'block';

    // When the admin clicks 'Helped', confirm the help action
    document.getElementById('helped-btn').addEventListener('click', function() {
        helpRequests.innerHTML = `<p>Help provided to student at PC ID: ${pcId}.</p>`;
        document.getElementById('pc-id').value = ''; // Clear the input field
    });

    // Reset the input field
    document.getElementById('pc-id').value = '';
});
// admin login
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
        getHelpRequests(); // Get real-time help requests after login
    } catch (error) {
        alert('Error logging in: ' + error.message);
    }
});
// When student clicks the 'Help Me!' button
document.getElementById('help-btn').addEventListener('click', async () => {
    const pcId = document.getElementById('pc-id').value;

    if (pcId === '') {
        alert('Please enter your PC ID!');
        return;
    }

    const message = `Student at PC ID: ${pcId} needs help!`;

    // Save the help request to Firestore
    await db.collection('help_requests').add({
        pcId: pcId,
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Clear input
    document.getElementById('pc-id').value = '';
});
// Get real-time help requests for the admin
function getHelpRequests() {
    db.collection('help_requests')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            const helpRequests = document.getElementById('help-requests');
            helpRequests.innerHTML = ''; // Clear the current requests

            snapshot.forEach(doc => {
                const request = doc.data();
                const pcId = request.pcId;
                const message = request.message;

                // Display the help request
                helpRequests.innerHTML += `
                    <div>
                        <p>${message}</p>
                        <button class="helped-btn" data-id="${doc.id}">Helped</button>
                    </div>
                `;
            });

            // Handle 'Helped' button click
            const helpedBtns = document.querySelectorAll('.helped-btn');
            helpedBtns.forEach(button => {
                button.addEventListener('click', async () => {
                    const requestId = button.getAttribute('data-id');

                    // Delete the request from Firestore after it's helped
                    await db.collection('help_requests').doc(requestId).delete();
                });
            });
        });
}