<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$basePath = '/kaina_backend/public';

if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}

if ($path === '') {
    $path = '/';
}

$router->dispatch($method, $path);