<?php
// Support static files for built-in PHP server
if (php_sapi_name() === 'cli-server') {
    $url = parse_url($_SERVER['REQUEST_URI']);
    $file = __DIR__ . $url['path'];
    if (is_file($file)) {
        return false;
    }
}

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Autoload classes
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/core/',
        __DIR__ . '/controllers/webcontent/',
        __DIR__ . '/controllers/ims/',
        __DIR__ . '/controllers/HR/',
        __DIR__ . '/models/',
        __DIR__ . '/models/ims/',
        __DIR__ . '/models/HR/',
         __DIR__ . '/models/webcontent/',
          __DIR__ . '/models/authentication/',
        __DIR__ . '/middleware/',
        __DIR__ .'/controllers/authentication/',
        __DIR__ .'/controllers/',
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