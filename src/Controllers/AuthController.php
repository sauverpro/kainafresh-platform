<?php

class AuthController
{
    public static function register(mysqli $mysqli): void
    {
        $data = json_decode(file_get_contents('php://input'), true);

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid email address'
            ]);

            return;
        }

        // Validate password
        if (strlen($password) < 8) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Password must be at least 8 characters'
            ]);

            return;
        }

        // Check if email already exists
        $stmt = $mysqli->prepare(
            'SELECT id FROM users WHERE email = ? LIMIT 1'
        );

        $stmt->bind_param('s', $email);
        $stmt->execute();

        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' => 'Email already registered'
            ]);

            return;
        }

        // Hash password
        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        // Create user
        $stmt = $mysqli->prepare(
            'INSERT INTO users (email, password) VALUES (?, ?)'
        );

        $stmt->bind_param(
            'ss',
            $email,
            $hashedPassword
        );

        if (!$stmt->execute()) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Could not create user'
            ]);

            return;
        }

        http_response_code(201);

        echo json_encode([
            'success' => true,
            'message' => 'User registered successfully'
        ]);
    }

    // Login function 
    public static function login(mysqli $mysqli): void
{
    $data = json_decode(file_get_contents('php://input'), true);

    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    // Validate input
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Email and password are required'
        ]);

        return;
    }

    // Find user
    $stmt = $mysqli->prepare(
        'SELECT id, email, password FROM users WHERE email = ? LIMIT 1'
    );

    $stmt->bind_param('s', $email);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    // Use the same message whether user exists or password is wrong
    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);

        return;
    }

    // Generate authentication token
    $token = bin2hex(random_bytes(32));

    // Hash token before storing it
    $tokenHash = hash('sha256', $token);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email']
        ]
    ]);
}

  public static function logout(mysqli $mysqli): void
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

        return;
    }

    $token = $matches[1];

    $tokenHash = hash('sha256', $token);

    $stmt = $mysqli->prepare(
        'DELETE FROM auth_tokens WHERE token_hash = ?'
    );

    $stmt->bind_param('s', $tokenHash);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Logout successful'
    ]);
}
}