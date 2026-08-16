<?php 

class Database {
 
private static $instance = null;
private  $connection;

// function to run our database connection and generate global connection string to use anywhere we need db connection
public function __construct(){

$config = require_once __DIR__ .'/../config/database.php';

$this->connection = new mysqli(
    $config['host'],
    $config['username'],
    $config['password'],
    $config['dbname'],
    $config['port']
);
if (!$this->connection->connect_error) {
    $this->connection->set_charset('utf8mb4');
} else {
    die('Database connection failed: ' . $this->connection->connect_error);
}
$this->connection->set_charset('utf8mb4');
}

public static function getInstance() {
    if (self::$instance === null) {
        self::$instance = new Database();
    }
    return self::$instance;
}
// get connection string
public function getConnection() {
    return $this->connection;
}

public function query($sql) {
    $result = $this->connection->query($sql);
    if ($result === false) {
        die('Database query failed: ' . $this->connection->error);
    }
    return $result;
}

public function prepare($sql) {
    $stmt = $this->connection->prepare($sql);
    if ($stmt === false) {
        die('Database prepare failed: ' . $this->connection->error);
    }
    return $stmt;
}

public function escapeString($string) {
        return $this->connection->real_escape_string($string);
    }

}

