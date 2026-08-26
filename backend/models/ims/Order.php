<?php

class Order extends Model
{
    protected $table = 'orders';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'customer_id',
        'order_date',
        'status',
        'total',
        'order_source'
    ];

    /**
     * Get all orders with user and customer information.
     */
    public function allWithRelations()
    {
        $sql = "SELECT
                    o.*,
                    u.username AS user_username,
                    u.full_name AS user_full_name,
                    c.first_name AS customer_first_name,
                    c.last_name AS customer_last_name,
                    c.phone AS customer_phone,
                    c.email AS customer_email
                FROM `{$this->table}` o
                INNER JOIN `users` u ON u.id = o.user_id
                LEFT JOIN `customers` c ON c.id = o.customer_id
                ORDER BY o.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get one order with user and customer information.
     */
    public function findWithRelations($id)
    {
        $sql = "SELECT
                    o.*,
                    u.username AS user_username,
                    u.full_name AS user_full_name,
                    c.first_name AS customer_first_name,
                    c.last_name AS customer_last_name,
                    c.phone AS customer_phone,
                    c.email AS customer_email
                FROM `{$this->table}` o
                INNER JOIN `users` u ON u.id = o.user_id
                LEFT JOIN `customers` c ON c.id = o.customer_id
                WHERE o.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Check whether a user exists.
     */
    public function userExists($userId)
    {
        $sql = "SELECT id FROM users WHERE id = ? LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();

        return $stmt->get_result()->num_rows > 0;
    }

    /**
     * Check whether a customer exists.
     */
    public function customerExists($customerId)
    {
        $sql = "SELECT id FROM customers WHERE id = ? LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $customerId);
        $stmt->execute();

        return $stmt->get_result()->num_rows > 0;
    }
}
