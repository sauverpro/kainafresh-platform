<?php

class EmployeeProfile extends Model
{
    protected $table = 'employee_profiles';

    protected $primaryKey = 'id';

    protected $fillable = [
        'fullname',
        'emp_number',
        'dob',
        'gender',
        'nid',
        'phone',
        'email',
        'address',
        'dept_id',
        'job_title',
        'date_hired',
        'employment_type',
        'emergency_person_name',
        'emergency_phone_number',
        'supervisor',
        'status',
        'probation_end_date',
        'probation_status',
        'probation_notes',
        'appointment_letter_ref',
        'contract_ref',
        'contract_end_date',
        'termination_date',
        'termination_reason',
    ];

    /**
     * Get all employee profiles, optionally filtered.
     *
     * Supported filters: status, dept_id, employment_type, search
     * (search matches fullname, emp_number, phone or email).
     */
    public function allEmployees($filters = [])
    {
        $where = [];
        $values = [];
        $types = '';

        if (!empty($filters['status'])) {
            $where[] = "e.status = ?";
            $values[] = $filters['status'];
            $types .= 's';
        }

        if (!empty($filters['dept_id'])) {
            $where[] = "e.dept_id = ?";
            $values[] = (int) $filters['dept_id'];
            $types .= 'i';
        }

        if (!empty($filters['employment_type'])) {
            $where[] = "e.employment_type = ?";
            $values[] = $filters['employment_type'];
            $types .= 's';
        }

        if (!empty($filters['search'])) {
            $where[] = "(e.fullname LIKE ? OR e.emp_number LIKE ? OR e.phone LIKE ? OR e.email LIKE ?)";
            $term = '%' . $filters['search'] . '%';
            array_push($values, $term, $term, $term, $term);
            $types .= 'ssss';
        }

        $sql = "SELECT e.*, d.name AS department_name
                FROM `{$this->table}` e
                LEFT JOIN `departments` d ON d.id = e.dept_id";

        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $sql .= " ORDER BY e.id DESC";

        $stmt = $this->db->prepare($sql);

        if (!empty($values)) {
            $stmt->bind_param($types, ...$values);
        }

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single employee profile with its department name.
     */
    public function findEmployee($id)
    {
        $sql = "SELECT e.*, d.name AS department_name
                FROM `{$this->table}` e
                LEFT JOIN `departments` d ON d.id = e.dept_id
                WHERE e.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Check whether a value is already used in a unique column,
     * ignoring the given employee id (used on update).
     */
    public function valueExists($column, $value, $excludeId = null)
    {
        if (!in_array($column, ['emp_number', 'nid'], true)) {
            return false;
        }

        $sql = "SELECT id
                FROM `{$this->table}`
                WHERE `{$column}` = ?";

        if ($excludeId !== null) {
            $sql .= " AND id != ?";
        }

        $sql .= " LIMIT 1";

        $stmt = $this->db->prepare($sql);

        if ($excludeId !== null) {
            $stmt->bind_param("si", $value, $excludeId);
        } else {
            $stmt->bind_param("s", $value);
        }

        $stmt->execute();

        $result = $stmt->get_result();

        return $result->num_rows > 0;
    }

    /**
     * Create an employee profile. Returns the new id or false.
     */
    public function createEmployee($data)
    {
        $data = array_intersect_key($data, array_flip($this->fillable));

        $columns = array_keys($data);
        $values = array_values($data);

        $placeholders = implode(', ', array_fill(0, count($values), '?'));

        $sql = "INSERT INTO `{$this->table}` (`" . implode('`, `', $columns) . "`)
                VALUES ({$placeholders})";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param($this->getParamTypes($values), ...$values);

        if ($stmt->execute()) {
            return $this->db->getConnection()->insert_id;
        }

        return false;
    }

    /**
     * Update the given fields of an employee profile.
     */
    public function updateEmployee($id, $data)
    {
        $data = array_intersect_key($data, array_flip($this->fillable));

        if (empty($data)) {
            return false;
        }

        $setClause = [];

        foreach (array_keys($data) as $column) {
            $setClause[] = "`{$column}` = ?";
        }

        $values = array_values($data);
        $values[] = (int) $id;

        $sql = "UPDATE `{$this->table}`
                SET " . implode(', ', $setClause) . "
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param($this->getParamTypes($values), ...$values);

        return $stmt->execute();
    }

    /**
     * Delete an employee profile.
     */
    public function deleteEmployee($id)
    {
        $sql = "DELETE FROM `{$this->table}`
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }

    // find employee by id
    public function findById($id)
    {
        $sql = "SELECT * FROM `{$this->table}` WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
}
