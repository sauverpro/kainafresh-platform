<?php

class Department extends Model
{
    protected $table = 'departments';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'dept_code',
        'HOD_name',
        'HOD_email',
        'Dep_description',
    ];

    /**
     * Get all departments.
     */
    public function allDepartments()
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                ORDER BY id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single department.
     */
    public function findDepartment($id)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Check whether a dept_code is already in use.
     */
    public function codeExists($code)
    {
        $sql = "SELECT `id`
                FROM `{$this->table}`
                WHERE `dept_code` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("s", $code);

        $stmt->execute();

        $result = $stmt->get_result();

        return $result->num_rows > 0;
    }

    /**
     * Create a department.
     */
    public function createDepartment($data)
    {
        return $this->create($data);
    }

    /**
     * Update a department.
     */
    public function updateDepartment($id, $data)
    {
        return $this->update($id, $data);
    }

    /**
     * Delete a department.
     */
    public function deleteDepartment($id)
    {
        return $this->delete($id);
    }
}
