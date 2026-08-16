<?php
class JWT {
    private static $secretKey;
    private static $algorithm = 'HS256';
    
    public static function init() {
        // Load secret key from environment or use default (change in production!)
        self::$secretKey = getenv('JWT_SECRET') ?: 'your-super-secret-key-change-this-in-production';
    }
    
    /**
     * Generate JWT token
     */
    public static function encode($payload, $expiry = 3600) {
        self::init();
        
        // Create header
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$algorithm
        ]);
        
        // Create payload with expiry
        $payload['exp'] = time() + $expiry;
        $payload['iat'] = time();
        $payload['iss'] = getenv('APP_URL') ?: 'localhost';
        
        $payloadJson = json_encode($payload);
        
        // Encode header and payload
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode($payloadJson);
        
        // Create signature
        $signature = hash_hmac('sha256', 
            $base64UrlHeader . "." . $base64UrlPayload, 
            self::$secretKey, 
            true
        );
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        // Create JWT
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
    
    /**
     * Decode and verify JWT token
     */
    public static function decode($token) {
        self::init();
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }
        
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
        
        // Verify signature
        $signature = self::base64UrlDecode($base64UrlSignature);
        $expectedSignature = hash_hmac('sha256', 
            $base64UrlHeader . "." . $base64UrlPayload, 
            self::$secretKey, 
            true
        );
        
        if (!hash_equals($signature, $expectedSignature)) {
            throw new Exception('Invalid signature');
        }
        
        // Decode payload
        $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);
        
        // Check expiry
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('Token has expired');
        }
        
        return $payload;
    }
    
    /**
     * Refresh token (generate new token with same payload)
     */
    public static function refresh($token, $expiry = 3600) {
        try {
            $payload = self::decode($token);
            unset($payload['exp']);
            unset($payload['iat']);
            return self::encode($payload, $expiry);
        } catch (Exception $e) {
            throw new Exception('Cannot refresh token: ' . $e->getMessage());
        }
    }
    
    /**
     * Get user ID from token
     */
    public static function getUserId($token) {
        $payload = self::decode($token);
        return $payload['user_id'] ?? null;
    }
    
    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private static function base64UrlDecode($data) {
        $padding = strlen($data) % 4;
        if ($padding > 0) {
            $data .= str_repeat('=', 4 - $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
}