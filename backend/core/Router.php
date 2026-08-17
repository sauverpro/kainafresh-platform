<?php

class Router {
    private $routes = [];
    private $request;
    
    public function __construct() {
        $this->request = new Request();
    }
    
    
    public function addRoute($method, $path, $handler, $middleware = null) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware // Can be null, 'auth', or array of middleware
        ];
    }
    
    public function dispatch() {
        $method = $this->request->getMethod();
        $uri = $this->request->getUri();
        
        foreach ($this->routes as $route) {
            $pattern = $this->convertToRegex($route['path']);
            
            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                
                
                if ($route['middleware'] !== null) {
                    $this->handleMiddleware($route['middleware']);
                }
                
                
                return $this->executeHandler($route['handler'], $matches);
            }
        }
        
        $this->sendNotFoundResponse();
    }
    
    /**
     * Handle middleware
     */
    private function handleMiddleware($middleware) {
        // If middleware is a string, convert to array
        if (is_string($middleware)) {
            $middleware = [$middleware];
        }
        
        // Process each middleware
        foreach ($middleware as $mw) {
            switch ($mw) {
                case 'auth':
                    $this->handleAuth();
                    break;
                default:
                    throw new Exception("Unknown middleware: " . $mw);
            }
        }
    }
    
    /**
     * Handle authentication middleware
     */
    private function handleAuth() {
        // Get headers
        $headers = $this->getHeaders();
        
        // Extract token
        $token = $this->extractToken($headers);
        
        if (!$token) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No token provided',
                'error_code' => 401
            ], 401);
        }
        
        // Validate token
        try {
            // Check if JWT class exists
            if (!class_exists('JWT')) {
                throw new Exception('JWT class not found');
            }
            
            // Decode token
            $payload = JWT::decode($token);
            
            // Store user info in global for later use
            $GLOBALS['authenticated_user_id'] = $payload['user_id'] ?? null;
            $GLOBALS['authenticated_user'] = $payload;
            $GLOBALS['authenticated_token'] = $token;
            
            return true;
            
        } catch (Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid token: ' . $e->getMessage(),
                'error_code' => 401
            ], 401);
        }
    }
    
    /**
     * Extract token from Authorization header
     */
    private function extractToken($headers) {
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if (!$authHeader) {
            return null;
        }
        
        // Check if it's a Bearer token
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        
        return null;
    }
    
    /**
     * Get all headers
     */
    private function getHeaders() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
    /**
     * Execute controller handler
     */
    private function executeHandler($handler, $params = []) {
        // If handler is a closure (anonymous function)
        if (is_callable($handler)) {
            return call_user_func_array($handler, $params);
        }
        
        // Handler is controller@method
        $parts = explode('@', $handler);
        if (count($parts) === 2) {
            $controllerName = $parts[0];
            $methodName = $parts[1];
            
            if (class_exists($controllerName)) {
                $controller = new $controllerName();
                if (method_exists($controller, $methodName)) {
                    return call_user_func_array([$controller, $methodName], $params);
                }
            }
        }
        
        throw new Exception("Handler not found: " . $handler);
    }
    
    /**
     * Send JSON response
     */
    private function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    private function convertToRegex($path) {
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '([^/]+)', $path);
        return '#^' . $pattern . '$#';
    }
    
    private function sendNotFoundResponse() {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
        exit;
    }
}