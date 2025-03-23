<?php
header('Content-Type: application/json');

$servername = "localhost";
$username = "root";
$password = "kutyapenisz23";
$dbname = "szrcs";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

if (!empty($_POST["username"]) && isset($_POST["score"])) {
    $username = trim($_POST["username"]);
    $score = filter_var($_POST["score"], FILTER_VALIDATE_INT);

    if ($score === false) {
        echo json_encode(["status" => "error", "message" => "Invalid score."]);
        exit;
    }
    $stmt = $conn->prepare("SELECT score FROM scoreboard WHERE name = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $existingScore = (int)$row["score"];

        if ($score > $existingScore) {
            $stmt = $conn->prepare("UPDATE scoreboard SET score = ? WHERE name = ?");
            $stmt->bind_param("is", $score, $username);
            $stmt->execute();
            echo json_encode(["status" => "success", "message" => "Score updated."]);
        } else {
            echo json_encode(["status" => "info", "message" => "Your score is not higher than the previous one."]);
        }
    } else {
        $stmt = $conn->prepare("INSERT INTO scoreboard (name, score) VALUES (?, ?)");
        $stmt->bind_param("si", $username, $score);
        $stmt->execute();
        echo json_encode(["status" => "success", "message" => "New score added."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid data."]);
}

$conn->close();
?>
