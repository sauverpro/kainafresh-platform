<?php

class User extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $fillable = ['username', 'email', 'password','role','full_name','phone_number','status'];

     
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM `{$this->table}` WHERE `email` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchOne($result);
    }
    
    public function findByUsername($username) {
        $sql = "SELECT * FROM `{$this->table}` WHERE `username` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchOne($result);
    }
    public function findByUserId($userId) {
        $sql = "SELECT * FROM `{$this->table}` WHERE `id` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("s",$userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchOne($result);
    }
    public function getAllUsers(){
        $sql = "SELECT * FROM `{$this->table}`";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchAll($result);
    }
    // create users
    public function createUser($data){
        return $this->create($data);
    }

    // get customers
     public function findCustomers() {
        $sql = "SELECT * FROM `{$this->table}` WHERE `role` = ?";
        $stmt = $this->db->prepare($sql);
        $role_type ="customer";
        $stmt->bind_param("s",$role_type);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchAll($result);
    }
    // update user

    public function updateUser($id, $data){
        return $this->update($id, $data);
    }
    // delete user
     public function deleteUser($id){
     return $this->delete($id);
    }
    // update password
    public function updatePassword($id, $newPassword) {
        try {
            // Hash the password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
            
            $sql = "UPDATE `{$this->table}` SET `password` = ? WHERE `id` = ?";
            $stmt = $this->db->prepare($sql);
            
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $this->db->getConnection()->error);
            }
            
            $stmt->bind_param("si", $hashedPassword, $id);
            
            if ($stmt->execute()) {
                // Return the updated user (without password)
                return $this->find($id);
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Password update error: " . $e->getMessage());
            return false;
        }
    }

public function verifyAndUpdatePassword($id, $currentPassword, $newPassword) {
        // Get user with password
        $user = $this->findByIdWithPassword($id);
        
        if (!$user) {
            return false;
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password'])) {
            return false;
        }
        
        // Update password
        return $this->updatePassword($id, $newPassword);
    }
public function findByIdWithPassword($id) {
        $sql = "SELECT * FROM `{$this->table}` WHERE `id` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    }