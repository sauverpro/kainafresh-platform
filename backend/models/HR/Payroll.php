<?php

class Payroll extends Model
{
    protected $table = 'payrolls';
    protected $primaryKey = 'id';
    protected $fillable = [
        'employee_id',
        'base_salary',
        'allowances',
        'overtime',
        'bonus',
        'tax_deductions',
        'pension_deductions',
        'other_deductions',
        'net_pay',
        'pay_date',
        'payment_status',
        'payment_start_date',
        'bank_account_number',
        'bank_name',
        'payment_ref',
        'note'
    ];
    // create payroll record
    public function createPayroll($data)
    {
        return $this->create($data);
    }
    // update payroll record
    public function updatePayroll($id, $data)
    {
        return $this->update($id, $data);
    }
    // delete payroll record
    public function deletePayroll($id)
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