<?php
// backend/migrations/MigrationGenerator.php

class MigrationGenerator {
    private $migrationsPath;
    
    public function __construct() {
        $this->migrationsPath = __DIR__ . '/migrations/';
        
        // Create migrations directory if it doesn't exist
        if (!is_dir($this->migrationsPath)) {
            if (!mkdir($this->migrationsPath, 0755, true)) {
                throw new Exception("Failed to create migrations directory: " . $this->migrationsPath);
            }
            echo " Created migrations directory: " . $this->migrationsPath . "\n";
        }
        
        // Check if directory is writable
        if (!is_writable($this->migrationsPath)) {
            throw new Exception("Migrations directory is not writable: " . $this->migrationsPath);
        }
    }
    
    public function create($name, $type = 'create') {
        // Sanitize the name
        $name = $this->sanitizeName($name);
        
        // Generate timestamp
        $timestamp = date('YmdHis');
        $filename = $timestamp . '_' . $name . '.php';
        $filepath = $this->migrationsPath . $filename;
        
        // Check if file already exists
        if (file_exists($filepath)) {
            throw new Exception("Migration file already exists: " . $filename);
        }
        
        // Determine migration type
        if (strpos($name, 'create_') === 0) {
            $type = 'create';
        } elseif (strpos($name, 'add_') === 0 || strpos($name, 'alter_') === 0) {
            $type = 'alter';
        }
        
        $content = $this->generateMigrationContent($name, $type);
        
        // Write the file
        if (file_put_contents($filepath, $content) === false) {
            throw new Exception("Failed to write migration file: " . $filepath);
        }
        
        return $filepath;
    }
    
    private function generateMigrationContent($name, $type) {
        $className = $this->generateClassName($name);
        $tableName = $this->extractTableName($name);
        
        if ($type === 'create') {
            return $this->generateCreateMigration($className, $tableName);
        } else {
            return $this->generateAlterMigration($className, $tableName);
        }
    }
    
    private function generateCreateMigration($className, $tableName) {
        return "<?php\n\n" .
               "// Migration: Create $tableName table\n" .
               "// Created: " . date('Y-m-d H:i:s') . "\n\n" .
               "class {$className} extends Migration\n" .
               "{\n" .
               "    public function up()\n" .
               "    {\n" .
               "        \$this->createTable('{$tableName}', [\n" .
               "            // Example columns:\n" .
               "            // ['name' => 'title', 'type' => 'VARCHAR', 'length' => 255],\n" .
               "            // ['name' => 'content', 'type' => 'TEXT'],\n" .
               "            // ['name' => 'status', 'type' => 'VARCHAR', 'length' => 20, 'default' => 'active'],\n" .
               "        ]);\n" .
               "    }\n" .
               "    \n" .
               "    public function down()\n" .
               "    {\n" .
               "        \$this->dropTable('{$tableName}');\n" .
               "    }\n" .
               "}\n";
    }
    
    private function generateAlterMigration($className, $tableName) {
        return "<?php\n\n" .
               "// Migration: Alter $tableName table\n" .
               "// Created: " . date('Y-m-d H:i:s') . "\n\n" .
               "class {$className} extends Migration\n" .
               "{\n" .
               "    public function up()\n" .
               "    {\n" .
               "        // Add columns\n" .
               "        \$this->addColumn('{$tableName}', [\n" .
               "            // ['name' => 'new_column', 'type' => 'VARCHAR', 'length' => 255],\n" .
               "            // ['name' => 'another_column', 'type' => 'INT', 'default' => 0],\n" .
               "        ]);\n" .
               "    }\n" .
               "    \n" .
               "    public function down()\n" .
               "    {\n" .
               "        // Drop columns (reverse order)\n" .
               "        // \$this->dropColumn('{$tableName}', 'new_column');\n" .
               "        // \$this->dropColumn('{$tableName}', 'another_column');\n" .
               "    }\n" .
               "}\n";
    }
    
    private function generateClassName($name) {
        // Remove prefixes for class name
        $cleanName = preg_replace('/^(create_|add_|alter_|drop_)/', '', $name);
        $parts = explode('_', $cleanName);
        $className = '';
        foreach ($parts as $part) {
            $className .= ucfirst($part);
        }
        return $className;
    }
    
    private function extractTableName($name) {
        if (strpos($name, 'create_') === 0) {
            return str_replace('create_', '', $name);
        } elseif (strpos($name, 'alter_') === 0) {
            return str_replace('alter_', '', $name);
        } elseif (strpos($name, 'add_') === 0) {
            $parts = explode('_to_', $name);
            return isset($parts[1]) ? $parts[1] : $name;
        }
        return $name;
    }
    
    private function sanitizeName($name) {
        $name = strtolower(trim($name));
        // Replace spaces and special characters with underscores
        $name = preg_replace('/[^a-z0-9_]/', '_', $name);
        // Remove multiple underscores
        $name = preg_replace('/_+/', '_', $name);
        // Remove trailing underscores
        $name = trim($name, '_');
        return $name;
    }
}