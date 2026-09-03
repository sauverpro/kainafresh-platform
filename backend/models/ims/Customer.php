<?php

class Customer extends Model
{
    protected $table = 'customers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'address',
        'segment'
    ];

    /**
     * Get all customers.
     */
    public function allCustomers()
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
     * Get a single customer.
     */
    public function findCustomer($id)
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
}
