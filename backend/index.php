<?php

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env');
    foreach ($lines as $line) {
        $line = trim($line);
        if (!empty($line) && strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}
//Load all classes automatically
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/core/',
        __DIR__ . '/models/',
        __DIR__ . '/controllers/',
        __DIR__ . '/middleware/',
        __DIR__ . '/migrations/',
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }
    
    // Log if class not found
    error_log("Class not found: " . $class);
    return false;
});

// Set error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set content type to JSON
header('Content-Type: application/json');

// Load routes

require_once __DIR__ . '/routes/api.php';

// Check if router is defined and dispatch
if (isset($router) && $router instanceof Router) {
    $router->dispatch();
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Router not initialized properly'
    ]);
}