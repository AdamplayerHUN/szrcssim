document.getElementById('nem').addEventListener('click', function() {
    document.getElementById('scoreForm').style.display = 'none';
    loadScoreboard();
});

function sendScore() {
    username = document.getElementById('username').value;

    if (!username || isNaN(score)) {
    alert("Hibás adatok!");
    return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('score', deathScore);

    fetch('../scoreboard.php', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json()) 
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Error sending score:', error);
    });
    document.getElementById('scoreForm').style.display = 'none';
    loadScoreboard();
}