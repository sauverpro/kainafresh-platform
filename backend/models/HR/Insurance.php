<?php

class Insurance extends Model{

protected $table ='insurances';
protected $primaryKey = 'id';

protected $fillable =[
    'employee_id',
    'insurance_type',
    'insurance_provider',
    'policy_number',
    'start_date',
    'expiration_date',
    'status',
    'premium_amount',
    'coverage_details',
    'notify_days'
];
    public function createInsurance($data){
        return $this->create($data);
    }
    public function updateInsurance($id, $data)
    {
        return $this->update($id, $data);
    }
    // delete payroll record
    public function deleteInsurance($id)
    {
        return $this->delete($id);
    }
    // select payroll
    public function findById($id){
        $sql = "SELECT * FROM `{$this->table}` WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
       public function findAll()
    {
        $sql = "SELECT * FROM `{$this->table}`";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

}