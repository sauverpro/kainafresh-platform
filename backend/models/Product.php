<?php

class Product extends Model
{
    protected $table = 'products';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'description',
        'product_image',
        'unit_id',
        'shelf_life',
        'price',
        'status'
    ];

    /**
     * Get all products with their unit information.
     */
    public function allWithUnits()
    {
        $sql = "SELECT
                    p.*,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` p
                LEFT JOIN `units` u ON u.id = p.unit_id
                ORDER BY p.id DESC";

        $stmt = $this->db->prepare($sql);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchAll($result);
    }

    /**
     * Get a single product with its unit information.
     */
    public function findWithUnit($id)
    {
        $sql = "SELECT
                    p.*,
                    u.code AS unit_code,
                    u.name AS unit_name,
                    u.symbol AS unit_symbol
                FROM `{$this->table}` p
                LEFT JOIN `units` u ON u.id = p.unit_id
                WHERE p.id = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $id);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Check whether a unit exists.
     */
    public function unitExists($unitId)
    {
        $sql = "SELECT `id`
                FROM `units`
                WHERE `id` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("i", $unitId);

        $stmt->execute();

        $result = $stmt->get_result();

        return $result->num_rows > 0;
    }
}