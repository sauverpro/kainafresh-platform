<?php 
class InsuranceController extends BaseController{
    protected $userModel;
protected $insuranceModel;
protected $employeeModel;
public function __construct()
    {
        $this->insuranceModel = new Insurance();
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

        $insurance = $this->insuranceModel->findAll();
        // get associated employee
         foreach ($insurance as &$performances) {
        $employee = $this->employeeModel->findById($performances['employee_id']);

        $performances['employee_name'] = $employee['fullname'] ?? 'Unknown Employee';
       
    }
    unset($performances); 

        $this->jsonResponse(['message' => 'insurance records retrieved successfully', 'data' => $insurance], 200);
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
        $validation = $this->validateRequired($data, ['employee_id', 'insurance_type', 'insurance_provider', 'policy_number', 'start_date', 'expiration_date', 'status','premium_amount','coverage_details','notify_days']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // let's ensure employee exists
        $employee = $this->employeeModel->findById($data['employee_id']);
        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }
      
        $created = $this->insuranceModel->createInsurance($data);
        $this->jsonResponse(['message' => 'Insurance  created successfully', 'data' => $created], 201);



    }

    public function updateInsurance($id)
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
        $insurance = $this->insuranceModel->findById($id);
        if (!$insurance) {
            $this->jsonResponse(['error' => 'Performance record not found'], 404);
        }
        // validate the data before updating the insurance record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'insurance_type', 'insurance_provider', 'policy_number', 'start_date', 'expiration_date', 'status','premium_amount','coverage_details','notify_days']);
        if($validation){
            $this->jsonResponse(['status'=>false,'error'=>$validation]);
        }
        $updatedata = $this->insuranceModel->updateInsurance($id, $data);
        $this->jsonResponse(['status'=>true,'message'=>'Updated','data'=>$updatedata]);
    }

    public function deleteInsurance($id)
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
        $insurance = $this->insuranceModel->findById($id);
        if (!$insurance) {
            $this->jsonResponse(['error' => 'Insurance record not found'], 404);
        }
        $deleted = $this->insuranceModel->deleteInsurance($id);
        $this->jsonResponse(['message' => 'Deleted successfully', 'data' => $deleted], 200);
    }

}