<?php

class PerformanceReview extends Model {
    protected $table = 'performance_reviews';
    protected $primaryKey = 'id';

    protected $fillable =[
        'employee_id',
        'reviewer_id',
        'target_set',
        'target_achieved',
        'strengths',
        'improvement_area',
        'overall_rating',
        'recommendation',
        'notes',
        'review_date',
        'review_period',
        'promotion'
    ];

    // create performance
    public function createPerformance($data){
        return $this->create($data);
    }
    public function updatePerformance($id, $data)
    {
        return $this->update($id, $data);
    }
    // delete payroll record
    public function deletePerformance($id)
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