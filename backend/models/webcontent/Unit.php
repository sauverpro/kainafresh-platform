<?php

class Unit extends Model
{
    protected $table = 'units';

    protected $primaryKey = 'id';

    protected $fillable = [
        'code',
        'name',
        'symbol'
    ];

    /**
     * Find a unit by code.
     */
    public function findByCode($code)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE `code` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("s", $code);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }
}