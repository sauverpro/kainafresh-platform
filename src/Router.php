<?php

class Router
{
    private array $routes = [];

    public function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    private function addRoute(
        string $method,
        string $path,
        callable $handler
    ): void {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    public function dispatch(
        string $method,
        string $path
    ): void {
        foreach ($this->routes as $route) {
            if (
                $route['method'] === $method &&
                $route['path'] === $path
            ) {
                call_user_func($route['handler']);
                return;
            }
        }

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
    }
}