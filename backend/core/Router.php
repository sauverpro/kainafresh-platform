<?php

class Router {
    private $routes = [];
    private $request;
    
    public function __construct() {
        $this->request = new Request();
    }
    
    public function addRoute($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }
    
    public function dispatch() {
        $method = $this->request->getMethod();
        $uri = $this->request->getUri();
        
        foreach ($this->routes as $route) {
            $pattern = $this->convertToRegex($route['path']);
            
            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches);
                
                $handler = explode('@', $route['handler']);
                $controllerName = $handler[0];
                $action = $handler[1];
                
                if (class_exists($controllerName)) {
                    $controller = new $controllerName();
                    if (method_exists($controller, $action)) {
                        return call_user_func_array([$controller, $action], $matches);
                    }
                }
                
                throw new Exception("Handler not found");
            }
        }
        
        $this->sendNotFoundResponse();
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