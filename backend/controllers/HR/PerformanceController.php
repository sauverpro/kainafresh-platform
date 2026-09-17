<?php

class PerformanceController extends BaseController{

protected $userModel;
protected $performanceModel;
protected $employeeModel;
public function __construct()
    {
        $this->performanceModel = new PerformanceReview();
        $this->userModel = new User();
        $this->employeeModel = new EmployeeProfile();
    }

    public function index()
    {
        // check if user is authorized to view leave requests
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
        // check if he is admin, sales_manager or hr_manager
        $userData = $this->userModel->findByUserId($user);
        if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
            $this->jsonResponse(['error' => 'Unauthorized'], 403);
        }

        $performance = $this->performanceModel->findAll();
        // get associated employee
         foreach ($performance as &$performances) {
        $employee = $this->employeeModel->findById($performances['employee_id']);

        $performances['employee_name'] = $employee['fullname'] ?? 'Unknown Employee';
       
    }
    unset($performances); 

        $this->jsonResponse(['message' => 'Perfomance records retrieved successfully', 'data' => $performance], 200);
    } 

    // create performance
    public function store(){
        // check if user is authorized to create payroll record
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
        // check if user is admin, sales_manager or hr_manager
        $userData = $this->userModel->findByUserId($user);
        if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
            $this->jsonResponse(['error' => 'Unauthorized'], 403);
        }
        // validate the data before creating the payroll record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'reviewer_id', 'target_set', 'target_achieved', 'strengths', 'improvement_area', 'overall_rating','recommendation','overtime','review_date','review_period']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // let's ensure employee exists
        $employee = $this->employeeModel->findById($data['employee_id']);
        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }
      
        $created = $this->performanceModel->createPerformance($data);
        $this->jsonResponse(['message' => 'Performance record created successfully', 'data' => $created], 201);



    }

    public function updatePerformance($id)
    {
        // check if user is authorized to update payroll record
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
        // check if user is admin, sales_manager or hr_manager
        $userData = $this->userModel->findByUserId($user);
        if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
            $this->jsonResponse(['error' => 'Unauthorized'], 403);
        }
        $performance = $this->performanceModel->findById($id);
        if (!$performance) {
            $this->jsonResponse(['error' => 'Performance record not found'], 404);
        }
        // validate the data before updating the performance record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'reviewer_id', 'target_set', 'target_achieved', 'strengths', 'improvement_area', 'overall_rating','recommendation','overtime','review_date','review_period']);
        if($validation){
            $this->jsonResponse(['status'=>false,'error'=>$validation]);
        }
        $updatedata = $this->performanceModel->updatePerformance($id, $data);
        $this->jsonResponse(['status'=>true,'message'=>'Updated','data'=>$updatedata]);
    }

    public function deletePerformance($id)
    {
        // check if user is authorized to delete leave request
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
        // check if user is admin, sales_manager or hr_manager
        $userData = $this->userModel->findByUserId($user);
        if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
            $this->jsonResponse(['error' => 'Unauthorized'], 403);
        }
        $performance = $this->performanceModel->findById($id);
        if (!$performance) {
            $this->jsonResponse(['error' => 'Payroll not found'], 404);
        }
        $deleted = $this->performanceModel->deletePerformance($id);
        $this->jsonResponse(['message' => 'Deleted successfully', 'data' => $deleted], 200);
    }
}