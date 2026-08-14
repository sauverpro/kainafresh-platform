<?php

require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Middleware/AuthMiddleware.php';

$router = new Router();

$router->get('/api/test', function () {
    echo json_encode([
        'success' => true,
        'message' => 'API is working'
    ]);
});
$router->post('/api/register', function () use ($mysqli) {
    AuthController::register($mysqli);
});
$router->post('/api/login', function () use ($mysqli) {
    AuthController::login($mysqli);
});

$router->get('/api/me', function () use ($mysqli) {

    $user = AuthMiddleware::user($mysqli);

    if (!$user) {
        return;
    }

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email']
        ]
    ]);
});
$router->post('/api/logout', function () use ($mysqli) {
    AuthController::logout($mysqli);
});