<?php
// backend/core/UploadHelper.php

class UploadHelper {
    private $uploadDir;
    private $allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
    ];
    private $maxFileSize = 5242880; // 5MB
    
    public function __construct() {
        $this->uploadDir = __DIR__ . '/../uploads/';
    }
    
    /**
     * Upload a file
     */
    public function upload($file, $subDir = 'images', $allowedTypes = null) {
        // Validate file
        $this->validateFile($file, $allowedTypes);
        
        // Generate unique filename
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $filename = uniqid() . '.' . $extension;
        $relativePath = $subDir . '/' . $filename;
        $fullPath = $this->uploadDir . $relativePath;
        
        // Create directory if it doesn't exist
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            throw new Exception('Failed to move uploaded file');
        }
        
        return [
            'filename' => $filename,
            'path' => '/uploads/' . $relativePath,
            'full_path' => $fullPath,
            'size' => $file['size'],
            'mime_type' => $file['type'],
            'extension' => $extension
        ];
    }
    
    /**
     * Upload logo specifically
     */
    public function uploadLogo($file) {
        return $this->upload($file, 'logos', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }
    
    /**
     * Validate uploaded file
     */
    private function validateFile($file, $allowedTypes = null) {
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception('No file uploaded');
        }
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds server upload limit',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds form upload limit',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
            ];
            $message = $errors[$file['error']] ?? 'Unknown upload error';
            throw new Exception($message);
        }
        
        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            throw new Exception('File size exceeds limit (5MB max)');
        }
        
        // Check file type
        $types = $allowedTypes ?? $this->allowedTypes;
        if (!in_array($file['type'], $types)) {
            throw new Exception('Invalid file type. Allowed: ' . implode(', ', $types));
        }
    }
    
    /**
     * Delete a file
     */
    public function deleteFile($path) {
        $fullPath = __DIR__ . '/..' . $path;
        if (file_exists($fullPath) && is_file($fullPath)) {
            return unlink($fullPath);
        }
        return false;
    }
}