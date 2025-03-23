<?php
header('Content-Type: application/json');

require_once "config.php";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Bruh. Sikertelen adatbázis kapcsolat"]));
}

$sql = "SELECT name, score FROM scoreboard ORDER BY score DESC LIMIT 10";
$result = $conn->query($sql);

$scores = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $scores[] = $row;
    }
}

echo json_encode(["status" => "success", "scores" => $scores]);

$conn->close();
?>
