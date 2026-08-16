<?php

class Request {
    public function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    public function getUri() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        return rtrim($uri, '/');
    }
    
    public function getQueryParams() {
        return $_GET;
    }
    
    public function getBody() {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?? [];
    }
    
    public function getHeaders() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace('_', '-', substr($key, 5));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
}