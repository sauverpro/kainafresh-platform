<?php
// load database connection
require_once __DIR__ . '/../core/Database.php';

// Load required files
require_once __DIR__ . '/Migration.php';
require_once __DIR__ . '/MigrationGenerator.php';

class MigrationRunner {
    private $db;
    private $migrationsPath;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->migrationsPath = __DIR__ . '/migrations/';
        $this->createMigrationsTable();
    }
    
    private function createMigrationsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `migrations` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `migration` VARCHAR(255) NOT NULL,
            `batch` INT NOT NULL,
            `executed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $this->db->query($sql);
    }
    
    public function run() {
        $executed = $this->getExecutedMigrations();
        $files = $this->getMigrationFiles();
        
        if (empty($files)) {
            echo "No migration files found.\n";
            return;
        }
        
        $batch = $this->getLastBatchNumber() + 1;
        $count = 0;
        
        foreach ($files as $file) {
            if (!in_array($file, $executed)) {
                $this->executeMigration($file, $batch);
                $count++;
            }
        }
        
        if ($count === 0) {
            echo "Nothing to migrate.\n";
        } else {
            echo "Migrated $count migration(s).\n";
        }
    }
    
    public function rollback($steps = 1) {
        $executed = $this->getExecutedMigrations();
        
        if (empty($executed)) {
            echo "Nothing to rollback.\n";
            return;
        }
        
        $batches = $this->getBatches($steps);
        
        foreach ($batches as $batch) {
            $migrations = $this->getMigrationsInBatch($batch);
            foreach ($migrations as $migration) {
                $this->rollbackMigration($migration);
            }
            echo "Rolled back batch $batch.\n";
        }
    }
    
    private function executeMigration($file, $batch) {
        $filePath = $this->migrationsPath . $file;
        if (!file_exists($filePath)) {
            echo "Error: Migration file not found: $file\n";
            return;
        }
        
        require_once $filePath;
        $className = $this->getClassNameFromFile($file);
        
        if (class_exists($className)) {
            $migration = new $className();
            $migration->up();
            
            $sql = "INSERT INTO `migrations` (`migration`, `batch`) VALUES (?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("si", $file, $batch);
            $stmt->execute();
            
            echo "Migrated: $file\n";
        } else {
            echo "Error: Class $className not found in $file\n";
        }
    }
    
    private function rollbackMigration($file) {
        $filePath = $this->migrationsPath . $file;
        if (!file_exists($filePath)) {
            echo "Error: Migration file not found: $file\n";
            return;
        }
        
        require_once $filePath;
        $className = $this->getClassNameFromFile($file);
        
        if (class_exists($className)) {
            $migration = new $className();
            $migration->down();
            
            $sql = "DELETE FROM `migrations` WHERE `migration` = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->bind_param("s", $file);
            $stmt->execute();
            
            echo "Rolled back: $file\n";
        } else {
            echo "Error: Class $className not found in $file\n";
        }
    }
    
    public function getExecutedMigrations() {
        $sql = "SELECT `migration` FROM `migrations` ORDER BY `id`";
        $result = $this->db->query($sql);
        $executed = [];
        
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $executed[] = $row['migration'];
            }
        }
        
        return $executed;
    }
    
    public function getMigrationFiles() {
        if (!is_dir($this->migrationsPath)) {
            mkdir($this->migrationsPath, 0755, true);
            return [];
        }
        
        $files = scandir($this->migrationsPath);
        $migrations = [];
        
        foreach ($files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                // Skip the base classes
                if ($file !== 'Migration.php' && 
                    $file !== 'MigrationRunner.php' && 
                    $file !== 'MigrationGenerator.php') {
                    $migrations[] = $file;
                }
            }
        }
        
        sort($migrations);
        return $migrations;
    }
    
     private function getClassNameFromFile($file) {
        $name = pathinfo($file, PATHINFO_FILENAME);
        // Remove timestamp prefix (YYYYMMDDHHMMSS_)
        $name = preg_replace('/^\d+_/', '', $name);
        // Convert snake_case to PascalCase
        $parts = explode('_', $name);
        $className = '';
        foreach ($parts as $part) {
            $className .= ucfirst($part);
        }
        return $className;
    }
    
    private function getLastBatchNumber() {
        $sql = "SELECT MAX(`batch`) as max_batch FROM `migrations`";
        $result = $this->db->query($sql);
        $row = $result->fetch_assoc();
        return (int)$row['max_batch'];
    }
    
    private function getBatches($steps) {
        $sql = "SELECT DISTINCT `batch` FROM `migrations` ORDER BY `batch` DESC LIMIT ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $steps);
        $stmt->execute();
        $result = $stmt->get_result();
        $batches = [];
        
        while ($row = $result->fetch_assoc()) {
            $batches[] = $row['batch'];
        }
        
        return $batches;
    }
    
    private function getMigrationsInBatch($batch) {
        $sql = "SELECT `migration` FROM `migrations` WHERE `batch` = ? ORDER BY `id` DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $batch);
        $stmt->execute();
        $result = $stmt->get_result();
        $migrations = [];
        
        while ($row = $result->fetch_assoc()) {
            $migrations[] = $row['migration'];
        }
        
        return $migrations;
    }
}

// CLI handling
if (php_sapi_name() === 'cli') {
    $command = $argv[1] ?? 'help';
    $option = $argv[2] ?? null;
    $extra = $argv[3] ?? null;
    
    $runner = new MigrationRunner();
    
    switch ($command) {
        case 'make':
            if (empty($option)) {
                echo " Please provide a migration name.\n";
                echo "Usage: php migrations/MigrationRunner.php make create_users_table\n";
                break;
            }
            
            try {
                // Ensure MigrationGenerator is loaded
                if (!class_exists('MigrationGenerator')) {
                    require_once __DIR__ . '/MigrationGenerator.php';
                }
                
                $generator = new MigrationGenerator();
                $type = $extra ?? 'create';
                $file = $generator->create($option, $type);
                echo " Created migration: " . basename($file) . "\n";
                echo " Location: " . $file . "\n";
            } catch (Exception $e) {
                echo "❌ Error: " . $e->getMessage() . "\n";
            }
            break;
            
        case 'migrate':
            $runner->run();
            break;
            
        case 'rollback':
            $steps = $option ? (int)$option : 1;
            $runner->rollback($steps);
            break;
            
        case 'status':
            $executed = $runner->getExecutedMigrations();
            $files = $runner->getMigrationFiles();
            
            echo "\nMigration Status:\n";
            echo str_repeat('-', 60) . "\n";
            
            if (empty($files)) {
                echo "No migration files found.\n";
            } else {
                foreach ($files as $file) {
                    $status = in_array($file, $executed) ? 'Executed' : 'Pending';
                    echo sprintf("%-50s %s\n", $file, $status);
                }
            }
            echo str_repeat('-', 60) . "\n";
            echo "Total: " . count($files) . " migrations\n";
            echo "Executed: " . count($executed) . "\n";
            echo "Pending: " . (count($files) - count($executed)) . "\n";
            break;
            
        case 'help':
        default:
            echo "\natabase Migration Commands:\n";
            echo str_repeat('-', 50) . "\n";
            echo "  php migrations/MigrationRunner.php make <name>     - Create a new migration\n";
            echo "    Examples:\n";
            echo "      php migrations/MigrationRunner.php make create_users_table\n";
            echo "      php migrations/MigrationRunner.php make add_email_to_users\n";
            echo "  php migrations/MigrationRunner.php migrate         - Run all pending migrations\n";
            echo "  php migrations/MigrationRunner.php rollback        - Rollback last migration\n";
            echo "  php migrations/MigrationRunner.php rollback [steps] - Rollback specified number\n";
            echo "  php migrations/MigrationRunner.php status          - Show migration status\n";
            echo str_repeat('-', 50) . "\n";
            break;
    }
}