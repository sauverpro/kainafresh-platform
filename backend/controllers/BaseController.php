<?php
// controllers/Controller.php

class BaseController {
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    protected function getRequestData() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?: [];
    }
    
    protected function validateRequired($data, $fields) {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return "The {$field} field is required.";
            }
        }
        return null;
    }
    protected function getHeaders() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', substr($key, 5))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
    protected function getAuthenticatedUserId() {
        return AuthMiddleware::getUserId();
    }
    
    protected function getAuthenticatedUser() {
        return AuthMiddleware::getUser();
    }
}