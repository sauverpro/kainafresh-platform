<?php
// backend/middleware/AuthMiddleware.php

class AuthMiddleware {
    private static $tokenModel;
    
    /**
     * Authenticate user via JWT token
     * This is called when ['auth'] middleware is used
     */
    public static function authenticate() {
        // Initialize token model
        if (!class_exists('Token')) {
            throw new Exception('Token model not found');
        }
        self::$tokenModel = new Token();
        
        // Get headers and extract token
        $headers = self::getHeaders();
        $token = self::extractToken($headers);
        
        if (!$token) {
            self::sendUnauthorized('No token provided');
        }
        
        try {
            // Decode and validate JWT
            if (!class_exists('JWT')) {
                throw new Exception('JWT class not found');
            }
            $payload = JWT::decode($token);
            
            // Check if token exists in database and is not expired
            $tokenRecord = self::$tokenModel->validateToken($token);
            
            if (!$tokenRecord) {
                self::sendUnauthorized('Invalid or revoked token');
            }
            
            // Verify user exists
            $userId = $payload['user_id'] ?? null;
            if (!$userId) {
                self::sendUnauthorized('Invalid token payload');
            }
            
            // Store authenticated user info globally
            $GLOBALS['authenticated_user_id'] = $userId;
            $GLOBALS['authenticated_user'] = $payload;
            $GLOBALS['authenticated_token'] = $token;
            
            
            
            return true;
            
        } catch (Exception $e) {
            self::sendUnauthorized($e->getMessage());
        }
    }
    
    /**
     * Get the authenticated user ID
     */
    public static function getUserId() {
        return $GLOBALS['authenticated_user_id'] ?? null;
    }
    
    /**
     * Get the authenticated user data
     */
    public static function getUser() {
        return $GLOBALS['authenticated_user'] ?? null;
    }
    
    /**
     * Get the current token
     */
    public static function getToken() {
        return $GLOBALS['authenticated_token'] ?? null;
    }
    
    /**
     * Extract token from Authorization header
     */
    private static function extractToken($headers) {
        // Check both lowercase and uppercase headers
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
     * Get all headers from request
     */
    private static function getHeaders() {
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
     * Send 401 Unauthorized response
     */
    private static function sendUnauthorized($message = 'Unauthorized') {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error_code' => 401
        ]);
        exit;
    }
}