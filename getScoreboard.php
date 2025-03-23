<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "kutyapenisz23";
$dbname = "szrcs";

// Kapcsolódás az adatbázishoz
$conn = new mysqli($servername, $username, $password, $dbname);

// Kapcsolati hiba ellenőrzése
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Bruh. Sikertelen adatbázis kapcsolat"]));
}

// Lekérdezzük a top 10 eredményt
$sql = "SELECT name, score FROM scoreboard ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$scores = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
}

// JSON formátumban visszaküldjük az adatokat
echo json_encode(["status" => "success", "scores" => $scores]);

$conn->close();
?>
