function loadScoreboard() {
    document.getElementById('scoreboard').style.display = 'flex';
    fetch('../getScoreboard.php')
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            let scoreboardHTML = "<h2>Top sigma épbokájú játékosok:</h2><ul>";
            data.scores.forEach((entry, index) => {
                scoreboardHTML += `<li>${index + 1}. ${entry.name} - ${entry.score} pont</li>`;
            });
            scoreboardHTML += `</ul><button onclick="document.getElementById('scoreboard').style.display = 'none';">OK</button>`;
            document.getElementById('scoreboard').innerHTML = scoreboardHTML;
        } else {
            document.getElementById('scoreboard').innerHTML = "<p>Hiba a toplista betöltésekor.</p>";
        }
    })
    .catch(error => {
        console.error('Hiba a scoreboard lekérésében:', error);
        document.getElementById('scoreboard').innerHTML = "<p>Bruh. Nem sikerült betölteni a toplistát.</p>";
    });
}     