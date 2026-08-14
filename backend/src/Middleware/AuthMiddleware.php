<?php

class AuthMiddleware
{
    public static function user(mysqli $mysqli): ?array
    {
        $headers = getallheaders();

        $authorization = $headers['Authorization']
            ?? $headers['authorization']
            ?? '';

        if (!preg_match('/^Bearer\s+(.+)$/i', $authorization, $matches)) {
            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' => 'Authentication required'
            ]);

            return null;
        }

        $token = $matches[1];

        // Hash the token before searching the database
        $tokenHash = hash('sha256', $token);

        $stmt = $mysqli->prepare(
            'SELECT users.id, users.email
             FROM auth_tokens
             INNER JOIN users ON users.id = auth_tokens.user_id
             WHERE auth_tokens.token_hash = ?
             AND auth_tokens.expires_at > NOW()
             LIMIT 1'
        );

        $stmt->bind_param('s', $tokenHash);
        $stmt->execute();

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user) {
            http_response_code(401);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid or expired token'
            ]);

            return null;
        }

        return $user;
    }
}