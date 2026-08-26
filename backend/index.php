<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Autoload classes
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/core/',
        __DIR__ . '/controllers/',
        __DIR__ . '/controllers/ims/',
        __DIR__ . '/models/',
        __DIR__ . '/models/ims/',
        __DIR__ . '/middleware/',
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';

        if (file_exists($file)) {
            require_once $file;
            return true;
        }
    }

    return false;
});


// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load routes
require_once __DIR__ . '/routes/api.php';

// Dispatch
try {
    $router->dispatch();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}