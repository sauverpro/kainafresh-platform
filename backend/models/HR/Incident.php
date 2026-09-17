<?php

class Incident extends Model
{
    protected $table = 'incident';

    protected $primaryKey = 'id';

    protected $fillable = [
        'emp_id',
        'incident_date',
        'incident_type',
        'duration_days',
        'severity',
        'description',
        'location',
        'reported_by',
    ];

    /**
     * Get all incidents, joined with the employee and reporter names.
     */
    public function allWithDetails()
    {
        $sql = "SELECT
                    i.*,
                    ep.fullname AS employee_name,
                    u.full_name AS reported_by_name
                FROM `{$this->table}` i
                LEFT JOIN `employee_profiles` ep ON i.emp_id = ep.id
                LEFT JOIN `users` u ON i.reported_by = u.id
                ORDER BY i.id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single incident, joined with the employee and reporter names.
     */
    public function findWithDetails($id)
    {
        $sql = "SELECT
                    i.*,
                    ep.fullname AS employee_name,
                    u.full_name AS reported_by_name
                FROM `{$this->table}` i
                LEFT JOIN `employee_profiles` ep ON i.emp_id = ep.id
                LEFT JOIN `users` u ON i.reported_by = u.id
                WHERE i.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }
}
