<?php
class DisciplinaryController extends BaseController{
protected $userModel;
protected $disciplinaryModel;
protected $employeeModel;
public function __construct()
    {
        $this->disciplinaryModel = new DisciplinaryACtion();
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

        $discplinary = $this->disciplinaryModel->findAll();
        // get associated employee
         foreach ($discplinary as &$performances) {
        $employee = $this->employeeModel->findById($performances['employee_id']);

        $performances['employee_name'] = $employee['fullname'] ?? 'Unknown Employee';
       
    }
    unset($performances); 

        $this->jsonResponse(['message' => 'Discplinary action records retrieved successfully', 'data' => $discplinary], 200);
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
        // validate the data before creating disciplinary record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'action_date', 'action_type', 'reason', 'description', 'issued_by', 'status']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // let's ensure employee exists
        $employee = $this->employeeModel->findById($data['employee_id']);
        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }
      
        $created = $this->disciplinaryModel->createDiscplinary($data);
        $this->jsonResponse(['message' => 'Disciplinary  created successfully', 'data' => $created], 201);



    }

    public function updateDisciplinary($id)
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
        $discip = $this->disciplinaryModel->findById($id);
        if (!$discip) {
            $this->jsonResponse(['error' => 'Performance record not found'], 404);
        }
        // validate the data before updating the record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'action_date', 'action_type', 'reason', 'description', 'issued_by', 'status']);
        if($validation){
            $this->jsonResponse(['status'=>false,'error'=>$validation]);
        }
        $updatedata = $this->disciplinaryModel->updateDiscplinary($id, $data);
        $this->jsonResponse(['status'=>true,'message'=>'Updated','data'=>$updatedata]);
    }

    public function deleteDisciplinary($id)
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
        $discip = $this->disciplinaryModel->findById($id);
        if (!$discip) {
            $this->jsonResponse(['error' => 'Record not found'], 404);
        }
        $deleted = $this->disciplinaryModel->deleteDiscplinary($id);
        $this->jsonResponse(['message' => 'Deleted successfully', 'data' => $deleted], 200);
    }
}