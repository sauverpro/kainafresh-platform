<?php

// this is an abstract class that will be extended by specific migration classes to define the structure of the database tables and their relationships. It provides methods for creating, dropping, and modifying tables and columns in the database.
abstract class Migration {
    protected $db;
    protected $table;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    abstract public function up();
    abstract public function down();
    
    protected function createTable($table, $columns) {
        $sql = "CREATE TABLE IF NOT EXISTS `$table` (\n";
        $sql .= "`id` INT AUTO_INCREMENT PRIMARY KEY,\n";
        
        foreach ($columns as $column) {
            $sql .= $this->buildColumnDefinition($column) . ",\n";
        }
        
        $sql .= "`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n";
        $sql .= "`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n";
        $sql .= ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        
        return $this->db->query($sql);
    }
    
    protected function buildColumnDefinition($column) {
        $def = "`{$column['name']}` {$column['type']}";
        
        if (isset($column['length'])) {
            $def = "`{$column['name']}` {$column['type']}({$column['length']})";
        }
        
        if (isset($column['nullable']) && !$column['nullable']) {
            $def .= " NOT NULL";
        }
        
        if (isset($column['default'])) {
            $def .= " DEFAULT '{$column['default']}'";
        }
        
        if (isset($column['auto_increment']) && $column['auto_increment']) {
            $def .= " AUTO_INCREMENT";
        }
        
        if (isset($column['unique']) && $column['unique']) {
            $def .= " UNIQUE";
        }
        
        return $def;
    }
    
    protected function dropTable($table) {
        $sql = "DROP TABLE IF EXISTS `$table`";
        return $this->db->query($sql);
    }
    
    protected function addColumn($table, $column) {
        $sql = "ALTER TABLE `$table` ADD " . $this->buildColumnDefinition($column);
        return $this->db->query($sql);
    }
    
    protected function dropColumn($table, $columnName) {
        $sql = "ALTER TABLE `$table` DROP COLUMN `$columnName`";
        return $this->db->query($sql);
    }
}