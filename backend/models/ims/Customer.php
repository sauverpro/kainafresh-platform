<?php

class Customer extends Model
{
    protected $table = 'customers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
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
       $sql = "SELECT 
                c.*,
                COALESCE(o.order_count, 0) AS total_orders
            FROM `{$this->table}` c
            INNER JOIN (
                SELECT user_id, MAX(id) AS max_id
                FROM `{$this->table}`
                WHERE user_id IS NOT NULL
                GROUP BY user_id
            ) latest ON latest.max_id = c.id
            LEFT JOIN (
                SELECT user_id, COUNT(*) AS order_count
                FROM `orders`
                GROUP BY user_id
            ) o ON o.user_id = c.user_id
            ORDER BY c.id DESC";

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

    // get customer by user_id
    public function findCustomerByUserId($id)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE user_id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }
}
