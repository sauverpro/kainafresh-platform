<?php
class AuthController extends BaseController {

private $userModel;
private $tokenModel;
    public function __construct() {
        $this->userModel = new User();
        $this->tokenModel = new Token();
        
    }
    public function test(){
        $this->jsonResponse(["message"=>"ok"],200);
    }

    // register new user
    public function register(){
       $data = $this->getRequestData();
        
        // Validate required fields
        $validation = $this->validateRequired($data, ['username', 'email', 'password','phone_number','full_name']);
        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
        // Check if email already exists
        if ($this->userModel->findByEmail($data['email'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Email already exists'
            ], 422);
        }
        
        // Check if username already exists
        if ($this->userModel->findByUsername($data['username'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Username already exists'
            ], 422);
        }
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
       
        $user = $this->userModel->create($data);
        
        
       
        
        
        $this->jsonResponse([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
            ]
        ], 201);
    }

    // login function
    public function login() {
        $data = $this->getRequestData();
        
        // Validate required fields
        $validation = $this->validateRequired($data, ['email', 'password']);
        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
        
        // Find user by email
        $user = $this->userModel->findByEmail($data['email']);
        
        if (!$user) {
            $this->jsonResponse([
                'success' => false,
                'message' =>'Account not found!',
            ], 401);
        }
        
        // Verify password
        if (!password_verify($data['password'], $user['password'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        // Check if user is active
        if (isset($user['is_active']) && $user['is_active'] == 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Account is deactivated'
            ], 403);
        }
        
        // Generate JWT token
        $token = JWT::encode([
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ]);
        $this->tokenModel->createToken($user['id'], $token, 3600);
        
        $this->jsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => 3600
            ]
        ]);
    }

}