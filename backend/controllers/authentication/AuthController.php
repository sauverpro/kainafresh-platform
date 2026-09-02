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
// list all user for admin
public function users(){
    $userId = $this->getAuthenticatedUserId();
    if( ! $userId ){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'You must Login!'
        ],400);
    }
    $users = $this->userModel->findByUserId($userId);
    if ($users['role'] !== 'admin'){
        return $this->jsonResponse([
            'success'=> false,
            'message'=> 'Unauthorized access'
        ], 403);
    }
    $userdata = $this->userModel->getAllUsers();
    $this->jsonResponse([
        'success'=> true,
        'data'=> $userdata
    ],201);
}

// create sales manager or admin users by admin only
public function createuser(){
    $userId = $this->getAuthenticatedUserId();
    if( !$userId ){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'Login first'
        ],400);
    }
    $user = $this->userModel->findByUserId($userId);
    if ($user['role'] !=='admin'){
        return $this->jsonResponse([
            'success'=> false,
            'message'=> 'Unauthorized access'
        ],403);
    }
$data = $this->getRequestData();
        
        // Validate required fields
        $validation = $this->validateRequired($data, ['username', 'email', 'password','phone_number','full_name','role']);
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
        
       
        $newuser = $this->userModel->createUser($data);
           $this->jsonResponse([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $newuser,
            ]
        ], 201);
}
// get all customers by both admin and sales manager
public function customers(){
    $userId = $this->getAuthenticatedUserId();
    if( ! $userId ){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'You must Login!'
        ],400);
    }
    $users = $this->userModel->findByUserId($userId);
    if ($users['role'] !== 'admin' && $users['role'] !=='sales_manager'){
        return $this->jsonResponse([
            'success'=> false,
            'message'=> 'Unauthorized access'
        ], 403);
    }
    $userdata = $this->userModel->findCustomers();
    $this->jsonResponse([
        'success'=> true,
        'data'=> $userdata
    ],201);
}
// update user
public function updateuser($id){
   $userId = $this->getAuthenticatedUserId();
    if( !$userId ){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'Login first'
        ],400);
    }
    $user = $this->userModel->findByUserId($userId);
    if ($user['role'] !=='admin'){
        return $this->jsonResponse([
            'success'=> false,
            'message'=> 'Unauthorized access'
        ],403);
    }
$data = $this->getRequestData();
        
        // Validate required fields
        $validation = $this->validateRequired($data, ['username', 'email','phone_number','full_name','role']);
        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }
      
       
        $newuser = $this->userModel->updateUser($id,$data);
           $this->jsonResponse([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => [
                'user' => $newuser,
            ]
        ], 201);

}
// delete user function
public function destroy($id){
    $userId = $this->getAuthenticatedUserId();
    if( !$userId ){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'Login first'
        ],400);
    }
    $user = $this->userModel->findByUserId($userId);
    if ($user['role'] !=='admin'){
        return $this->jsonResponse([
            'success'=> false,
            'message'=> 'Unauthorized access'
        ],403);
    }

    $deleteduser = $this->userModel->deleteUser($id);
    if($deleteduser){
        $this->jsonResponse([
            'success'=> false,
            'message'=> 'User Deleted!'
        ],201);
    }
    $this->jsonResponse([
            'success'=> false,
            'message'=> 'Something went wrong'
        ],500);

}
// update password
public function updatepassword($id){
     try {
            // Check if user is authenticated
            $userId = $this->getAuthenticatedUserId();
            if (!$userId) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Unauthorized. Please login.'
                ], 401);
            }
            
            // Check if user is updating their own password or is admin
            $user = $this->userModel->findByUserId($userId);
            if ($user['role'] !== 'admin' && (int)$userId !== (int)$id) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'You can only update your own password'
                ], 403);
            }
            
            // Get request data
            $data = $this->getRequestData();
            
            // Validate required fields
            $validation = $this->validateRequired($data, ['current_password', 'new_password']);
            if ($validation) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => $validation
                ], 422);
            }
            
            // Validate new password length
            if (strlen($data['new_password']) < 8) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'New password must be at least 8 characters long'
                ], 422);
            }
            
            // If admin is updating another user's password, skip current password check
            if ($user['role'] === 'admin' && (int)$userId !== (int)$id) {
                // Admin can update any user's password without current password
                $updated = $this->userModel->updatePassword($id, $data['new_password']);
                
                if ($updated) {
                    return $this->jsonResponse([
                        'success' => true,
                        'message' => 'Password updated successfully',
                        'data' => $updated
                    ]);
                } else {
                    return $this->jsonResponse([
                        'success' => false,
                        'message' => 'Failed to update password'
                    ], 500);
                }
            }

            // check if the new password is not the same as current password
            if(password_verify($data['new_password'],$user['password'])){
                $this->jsonResponse([
                    'success'=> true,
                    'message'=> 'New password must not be the same as current password'],422);
            }
            
            // User updating their own password - verify current password
            $updated = $this->userModel->verifyAndUpdatePassword(
                $id,
                $data['current_password'],
                $data['new_password']
            );
            
            if ($updated) {
                return $this->jsonResponse([
                    'success' => true,
                    'message' => 'Password updated successfully',
                    'data' => $updated
                ]);
            } else {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }
            
        } catch (Exception $e) {
            error_log("Password update error: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}