<?php

class Stock extends Model
{
    protected $table = 'stocks';

    protected $primaryKey = 'id';

    protected $fillable = [
        'productid',
        'variety',
        'grade',
        'quantity',
        'farm_plot',
        'harvest_date',
        'pack_date'
    ];

    /**
     * Get all stocks with product and unit information.
     */
    public function allWithProducts()
    {
        $sql = "SELECT
                    s.*,
                    p.name AS product_name,
                    p.product_image,
                    p.unit_id,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` s
                INNER JOIN `products` p
                    ON p.id = s.productid
                LEFT JOIN `units` u
                    ON u.id = p.unit_id
                ORDER BY s.id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single stock with product and unit information.
     */
    public function findWithProduct($id)
    {
        $sql = "SELECT
                    s.*,
                    p.name AS product_name,
                    p.product_image,
                    p.unit_id,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` s
                INNER JOIN `products` p
                    ON p.id = s.productid
                LEFT JOIN `units` u
                    ON u.id = p.unit_id
                WHERE s.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Check whether a product exists.
     */
    public function productExists($productId)
    {
        $sql = "SELECT `id`
                FROM `products`
                WHERE `id` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $productId);

        $stmt->execute();

        $result = $stmt->get_result();

        return $result->num_rows > 0;
    }
}
