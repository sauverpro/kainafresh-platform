<?php
// backend/middleware/AuthMiddleware.php

class AuthMiddleware {
    /**
     * Handle authentication
     */
    public static function authenticate() {
        $headers = self::getHeaders();
        $token = self::extractToken($headers);
        
        if (!$token) {
            self::sendUnauthorized('No token provided');
        }
        
        try {
            $payload = JWT::decode($token);
            
            // Optional: Check if user exists and is active
            $userId = $payload['user_id'] ?? null;
            if (!$userId) {
                self::sendUnauthorized('Invalid token');
            }
            
            // Store user ID in global context for later use
            $GLOBALS['authenticated_user_id'] = $userId;
            $GLOBALS['authenticated_user'] = $payload;
            
            return true;
        } catch (Exception $e) {
            self::sendUnauthorized($e->getMessage());
        }
    }
    
    /**
     * Require specific role
     */
    public static function requireRole($role) {
        self::authenticate();
        
        $user = $GLOBALS['authenticated_user'] ?? null;
        
        if (!$user || ($user['role'] ?? 'user') !== $role) {
            self::sendForbidden('Insufficient permissions');
        }
        
        return true;
    }
    
    /**
     * Get authenticated user ID
     */
    public static function getUserId() {
        return $GLOBALS['authenticated_user_id'] ?? null;
    }
    
    /**
     * Get authenticated user data
     */
    public static function getUser() {
        return $GLOBALS['authenticated_user'] ?? null;
    }
    
    private static function extractToken($headers) {
        if (!isset($headers['Authorization']) && !isset($headers['authorization'])) {
            return null;
        }
        
        $authHeader = $headers['Authorization'] ?? $headers['authorization'];
        
        if (strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        
        return null;
    }
    
    private static function getHeaders() {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', substr($key, 5))));
                $headers[$header] = $value;
            }
        }
        return $headers;
    }
    
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
    
    private static function sendForbidden($message = 'Forbidden') {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'error_code' => 403
        ]);
        exit;
    }
}