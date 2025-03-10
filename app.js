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