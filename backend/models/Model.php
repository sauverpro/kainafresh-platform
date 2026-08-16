<?php
// models/Model.php
abstract class Model {
    protected $db;
    protected $table;
    protected $primaryKey = 'id';
    protected $fillable = [];
    protected $hidden = [];
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    public function all() {
        $sql = "SELECT * FROM `{$this->table}`";
        $result = $this->db->query($sql);
        return $this->fetchAll($result);
    }
    
    public function find($id) {
        $sql = "SELECT * FROM `{$this->table}` WHERE `{$this->primaryKey}` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $this->fetchOne($result);
    }
    
    public function create($data) {
        $filteredData = array_intersect_key($data, array_flip($this->fillable));
        $columns = array_keys($filteredData);
        $values = array_values($filteredData);
        
        $placeholders = implode(',', array_fill(0, count($values), '?'));
        $sql = "INSERT INTO `{$this->table}` (`" . implode('`,`', $columns) . "`) VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($sql);
        $types = $this->getParamTypes($values);
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            return $this->find($this->db->getConnection()->insert_id);
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $filteredData = array_intersect_key($data, array_flip($this->fillable));
        $setClause = [];
        $values = [];
        
        foreach ($filteredData as $column => $value) {
            $setClause[] = "`$column` = ?";
            $values[] = $value;
        }
        
        $values[] = $id;
        $sql = "UPDATE `{$this->table}` SET " . implode(', ', $setClause) . " WHERE `{$this->primaryKey}` = ?";
        
        $stmt = $this->db->prepare($sql);
        $types = $this->getParamTypes($values);
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            return $this->find($id);
        }
        
        return false;
    }
    
    public function delete($id) {
        $sql = "DELETE FROM `{$this->table}` WHERE `{$this->primaryKey}` = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
    
    protected function fetchAll($result) {
        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $this->filterHidden($row);
        }
        return $items;
    }
    
    protected function fetchOne($result) {
        $row = $result->fetch_assoc();
        return $row ? $this->filterHidden($row) : null;
    }
    
    protected function filterHidden($data) {
        foreach ($this->hidden as $key) {
            unset($data[$key]);
        }
        return $data;
    }
    
    protected function getParamTypes($values) {
        $types = '';
        foreach ($values as $value) {
            if (is_int($value)) {
                $types .= 'i';
            } elseif (is_float($value)) {
                $types .= 'd';
            } else {
                $types .= 's';
            }
        }
        return $types;
    }
}