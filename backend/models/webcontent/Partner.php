<?php
// backend/models/Partner.php

class Partner extends Model {
    public $table = "partners";
    public $primaryKey = "id";

    protected $fillable = [
        'partner_name',
        'partner_logo',
        'partner_link',
    ];
    
    public function getPartners() {
        $all = $this->all();
        return !empty($all) ? $all[0] : null;
    }

    public function addPartner($data) {
        return $this->create($data);
    }

    /**
     * Update a partner with proper error handling
     */
    public function updatePartner($id, $data) {
        try {
            // Log incoming data for debugging
            error_log("=== PARTNER UPDATE ===");
            error_log("ID: " . $id);
            error_log("Data: " . print_r($data, true));
            
            // Check if partner exists
            $existing = $this->find($id);
            if (!$existing) {
                error_log("Partner not found with ID: " . $id);
                return false;
            }
            
            // Filter data by fillable
            $filteredData = array_intersect_key($data, array_flip($this->fillable));
            
            if (empty($filteredData)) {
                error_log("No data to update");
                return false;
            }
            
            error_log("Filtered Data: " . print_r($filteredData, true));
            
            // Call parent update method
            $result = $this->update($id, $filteredData);
            
            error_log("Update result: " . ($result ? 'true' : 'false'));
            
            return $result;
        } catch (Exception $e) {
            error_log("Update error: " . $e->getMessage());
            error_log("Update error trace: " . $e->getTraceAsString());
            return false;
        }
    }
    
    public function deletePartner($id) {
        return $this->delete($id);
    }
}