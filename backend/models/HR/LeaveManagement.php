<?php 
class LeaveManagement extends Model
{
    protected $table = 'leave_managements';
    protected $primaryKey = 'id';
    protected $fillable = ['employee_id', 'leave_type', 'start_date', 'end_date', 'leave_reason','reject_reason', 'leave_duration', 'status'];
    protected $timestamps = true;

    // create leave request
    public function createLeaveRequest($data)
    {
        
    return  $this->create($data);
        
    }

    // accept leave request
    public function acceptLeaveRequest($id)
    {
        $data = ['status' => 'approved', 'reject_reason' => null];
        return $this->update($id, $data);
    }

    // reject leave request
    public function rejectLeaveRequest($id, $rejectReason)
    {
        $data = ['status' => 'rejected', 'reject_reason' => $rejectReason];
        return $this->update($id, $data);
    }
    // update leave request
    public function updateLeaveRequest($id, $data)
    {
        return $this->update($id, $data);
    }
    // delete leave request
    public function deleteLeaveRequest($id)
    {
        return $this->delete($id);
    }
    // select leave request by id
    public function findById($id)
    {
        $sql = "SELECT * FROM `{$this->table}` WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
    // select all leave requests
    public function findAll()
    {
        $sql = "SELECT * FROM `{$this->table}`";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}