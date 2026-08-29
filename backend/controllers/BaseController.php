<?php

class BaseController {
    protected function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Get request data (handles both JSON and form-data)
     */
    protected function getRequestData() {
        $data = [];
        
        // 1. Get JSON data from php://input
        $rawInput = file_get_contents('php://input');
        if (!empty($rawInput)) {
            $jsonData = json_decode($rawInput, true);
            if (is_array($jsonData)) {
                $data = array_merge($data, $jsonData);
            }
        }
        
        // 2. Get form-data from $_POST
        if (!empty($_POST)) {
            $data = array_merge($data, $_POST);
        }
        
        // 3. Also check $_REQUEST as fallback
        if (!empty($_REQUEST)) {
            $data = array_merge($data, $_REQUEST);
        }
        
        return $data;
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
        if (class_exists('AuthMiddleware')) {
            return AuthMiddleware::getUserId();
        }
        return null;
    }
}