<?php

class OrderItem extends Model
{
    protected $table = 'order_items';

    protected $primaryKey = 'id';

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'unit_price',
        'subtotal'
    ];

    /**
     * Get all order items with product information.
     */
    public function allWithProduct()
    {
        $sql = "SELECT
                    oi.*,
                    p.name AS product_name,
                    p.product_image,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` oi
                INNER JOIN `products` p
                    ON p.id = oi.product_id
                LEFT JOIN `units` u
                    ON u.id = p.unit_id
                ORDER BY oi.id DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get one order item with product information.
     */
    public function findWithProduct($id)
    {
        $sql = "SELECT
                    oi.*,
                    p.name AS product_name,
                    p.product_image,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` oi
                INNER JOIN `products` p
                    ON p.id = oi.product_id
                LEFT JOIN `units` u
                    ON u.id = p.unit_id
                WHERE oi.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Get all items belonging to an order.
     */
    public function findByOrder($orderId)
    {
        $sql = "SELECT
                    oi.*,
                    p.name AS product_name,
                    p.product_image,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` oi
                INNER JOIN `products` p
                    ON p.id = oi.product_id
                LEFT JOIN `units` u
                    ON u.id = p.unit_id
                WHERE oi.order_id = ?
                ORDER BY oi.id ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $orderId);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Check whether an order exists.
     */
    public function orderExists($orderId)
    {
        $sql = "SELECT id
                FROM orders
                WHERE id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $orderId);
        $stmt->execute();

        return $stmt->get_result()->num_rows > 0;
    }

    /**
     * Check whether a product exists.
     */
    public function productExists($productId)
    {
        $sql = "SELECT id
                FROM products
                WHERE id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $productId);
        $stmt->execute();

        return $stmt->get_result()->num_rows > 0;
    }

    /**
     * Get product price.
     */
    public function getProductPrice($productId)
    {
        $sql = "SELECT price
                FROM products
                WHERE id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $productId);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }
}
