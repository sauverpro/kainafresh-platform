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
    }