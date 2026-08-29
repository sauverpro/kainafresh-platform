<?php

class PartnerController extends BaseController {
    private $partner;
    private $user_model;
    
    public function __construct() {
        $this->user_model = new User();
        $this->partner = new Partner();
    }

  public function index() {
    $data = $this->partner->getPartners();
    return $this->jsonResponse(['status'=>true,'data'=>$data]);
  }
 

    public function partner($id) {
        try { 
            
            // Check authentication
            $userId = $this->getAuthenticatedUserId();
            if (!$userId) {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'You must Login'
                ], 401);
            }
            
            // Check admin role
            $user = $this->user_model->findByUserId($userId);
            if ($user['role'] !== 'admin') {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }
            
            // Check if partner exists
            $existingPartner = $this->partner->find($id);
            if (!$existingPartner) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Partner not found with ID: ' . $id
                ], 404);
            }
            
            // Get data from $_POST directly (form-data)
            $data = [];
            
            // Check if we have POST data
            if (!empty($_POST)) {
                $data = $_POST;
                error_log("Data from POST: " . print_r($data, true));
            }
            
            // Also check for JSON data
            $rawInput = file_get_contents('php://input');
            if (!empty($rawInput)) {
                $jsonData = json_decode($rawInput, true);
                if (is_array($jsonData) && !empty($jsonData)) {
                    $data = array_merge($data, $jsonData);
                    error_log("Data from JSON: " . print_r($jsonData, true));
                }
            }
            
            // If still no data, try $_REQUEST
            if (empty($data) && !empty($_REQUEST)) {
                $data = $_REQUEST;
                error_log("Data from REQUEST: " . print_r($data, true));
            }
            
            // Debug: Log the final data
            error_log("Final data: " . print_r($data, true));
            
            if (empty($data)) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'No data provided for update. Please check your request body.'
                ], 422);
            }
            
            // Handle logo upload if provided
            if (isset($_FILES['partner_logo']) && $_FILES['partner_logo']['error'] !== UPLOAD_ERR_NO_FILE) {
                error_log("Logo file detected: " . print_r($_FILES['partner_logo'], true));
                try {
                    $uploadHelper = new UploadHelper();
                    $uploadResult = $uploadHelper->uploadLogo($_FILES['partner_logo']);
                    $data['partner_logo'] = $uploadResult['path'];
                    error_log("Logo uploaded: " . $uploadResult['path']);
                } catch (Exception $e) {
                    error_log("Logo upload error: " . $e->getMessage());
                    return $this->jsonResponse([
                        'success' => false, 
                        'message' => 'Logo upload failed: ' . $e->getMessage()
                    ], 422);
                }
            }
            // Update partner
            $updated = $this->partner->updatePartner($id, $data);
            
            if ($updated) {
                return $this->jsonResponse([
                    'success' => true, 
                    'data' => $updated,
                    'message' => 'Partner updated successfully'
                ], 200);
            } else {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'Failed to update partner. Please check the data and try again.'
                ], 500);
            }
        } catch (Exception $e) {
            // error_log("Edit error: " . $e->getMessage());
            // error_log("Edit trace: " . $e->getTraceAsString());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
 public function destroy($id) {
        try {
            $userId = $this->getAuthenticatedUserId();
            if (!$userId) {
                return $this->jsonResponse(['success' => false, 'message' => 'You must Login'], 401);
            }
            
            $user = $this->user_model->findByUserId($userId);
            if ($user['role'] !== 'admin') {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }
            
            $deleted = $this->partner->deletePartner($id);
            if ($deleted) {
                return $this->jsonResponse([
                    'success' => true, 
                    'message' => 'Partner deleted successfully'
                ], 200);
            } else {
                return $this->jsonResponse([
                    'success' => false, 
                    'message' => 'Failed to delete partner'
                ], 500);
            }
        } catch (Exception $e) {
            // error_log("Delete error: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}