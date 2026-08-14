<?php
$env = parse_ini_file(__DIR__ . '/../.env');

$host = $env['DB_HOST'];
$port = $env['DB_PORT'];
$dbname = $env['DB_NAME'];
$username = $env['DB_USER'];
$password = $env['DB_PASSWORD'];

$mysqli = new mysqli(
    $host,
    $username,
    $password,
    $dbname,
    $port
);

if ($mysqli->connect_error) {
    die('Database connection failed.');
}

$mysqli->set_charset('utf8mb4');