<?php
// backend/models/Token.php

class Token extends Model {
    protected $table = 'auth_tokens';
    protected $fillable = [
        'user_id', 'token', 'expires_at', 
         'ip_address', 'user_agent', 
       
    ];
    
    /**
     * Create a new token record
     */
    public function createToken($userId, $token, $expiresIn = 3600) {
        $data = [
            'user_id' => $userId,
            'token' => $token,
          
            'expires_at' => date('Y-m-d H:i:s', time() + $expiresIn),
           
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
            
        ];
        
        return $this->create($data);
    }
    
    /**
     * Validate token
     */
    public function validateToken($token) {
        $sql = "SELECT * FROM `{$this->table}` 
                WHERE `token` = ? 
                AND `expires_at` > NOW()";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchOne($result);
    }
  
    
  
 
  
    /**
     * Get user's active sessions
     */
    
      
      public function getUserSessions($userId) {
        $sql = "SELECT * FROM `{$this->table}` 
                WHERE `user_id` = ? 
                AND `expires_at` > NOW()";
               
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param($userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchAll($result);
    }
  
}