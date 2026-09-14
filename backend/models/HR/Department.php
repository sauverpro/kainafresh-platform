<?php

class Department extends Model
{
    protected $table = 'departments';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
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
     * Create a department.
     */
public function createDepartment($data)
{
    $sql = "INSERT INTO `{$this->table}` (`name`)
            VALUES (?)";

    $stmt = $this->db->prepare($sql);

    $stmt->bind_param(
        "s",
        $data['name']
    );

    if ($stmt->execute()) {
        return $this->db->getConnection()->insert_id;
    }

    return false;
}


    /**
     * Update a department.
     */
    public function updateDepartment($id, $data)
    {
        $sql = "UPDATE `{$this->table}`
                SET `name` = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param(
            "si",
            $data['name'],
            $id
        );

        return $stmt->execute();
    }

    /**
     * Delete a department.
     */
    public function deleteDepartment($id)
    {
        $sql = "DELETE FROM `{$this->table}`
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }
}
