<?php

class Training extends Model
{
    protected $table = 'trainings';

    protected $primaryKey = 'id';

    protected $fillable = [
        'emp_id',
        'training_name',
        'training_type',
        'start_date',
        'end_date',
        'duration_days',
        'cost',
        'certification_ref',
        'skills_gained',
        'status',
        'notes',
    ];

    /**
     * Get all trainings.
     */
    public function allTrainings()
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
     * Get all trainings with employee information.
     */
    public function allTrainingsWithEmployees()
    {
        $sql = "SELECT
                    t.*,
                    ep.fullname
                FROM `{$this->table}` t
                LEFT JOIN `employee_profiles` ep
                    ON t.emp_id = ep.id
                ORDER BY t.id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single training.
     */
    public function findTraining($id)
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
     * Get a single training with employee information.
     */
    public function findTrainingWithEmployee($id)
    {
        $sql = "SELECT
                    t.*,
                    ep.fullname
                FROM `{$this->table}` t
                LEFT JOIN `employee_profiles` ep
                    ON t.emp_id = ep.id
                WHERE t.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Create a training.
     */
    public function createTraining($data)
    {
        $sql = "INSERT INTO `{$this->table}`
                (
                    `emp_id`,
                    `training_name`,
                    `training_type`,
                    `start_date`,
                    `end_date`,
                    `duration_days`,
                    `cost`,
                    `certification_ref`,
                    `skills_gained`,
                    `status`,
                    `notes`
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param(
            "issssidssss",
            $data['emp_id'],
            $data['training_name'],
            $data['training_type'],
            $data['start_date'],
            $data['end_date'],
            $data['duration_days'],
            $data['cost'],
            $data['certification_ref'],
            $data['skills_gained'],
            $data['status'],
            $data['notes']
        );

        if ($stmt->execute()) {
            return $this->db->getConnection()->insert_id;
        }

        return false;
    }

    /**
     * Update a training.
     */
    public function updateTraining($id, $data)
    {
        $sql = "UPDATE `{$this->table}`
                SET
                    `emp_id` = ?,
                    `training_name` = ?,
                    `training_type` = ?,
                    `start_date` = ?,
                    `end_date` = ?,
                    `duration_days` = ?,
                    `cost` = ?,
                    `certification_ref` = ?,
                    `skills_gained` = ?,
                    `status` = ?,
                    `notes` = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param(
            "issssidssssi",
            $data['emp_id'],
            $data['training_name'],
            $data['training_type'],
            $data['start_date'],
            $data['end_date'],
            $data['duration_days'],
            $data['cost'],
            $data['certification_ref'],
            $data['skills_gained'],
            $data['status'],
            $data['notes'],
            $id
        );

        return $stmt->execute();
    }

    /**
     * Delete a training.
     */
    public function deleteTraining($id)
    {
        $sql = "DELETE FROM `{$this->table}`
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        return $stmt->execute();
    }
}