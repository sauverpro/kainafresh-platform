<?php

class PayrollController extends BaseController
{
    protected $payrollModel;
    protected $userModel;
    protected $employeeModel;

    public function __construct()
    {
        $this->payrollModel = new Payroll();
        $this->userModel = new User();
        $this->employeeModel = new EmployeeProfile();
    }

    // get all payroll records

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
        $payroll = $this->payrollModel->findAll();
        $this->jsonResponse(['message' => 'Payroll records retrieved successfully', 'data' => $payroll], 200);
    } 
    // create payroll record
    public function createPayroll()
    {
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
        $validation = $this->validateRequired($data, ['employee_id', 'base_salary', 'pay_date', 'payment_start_date', 'bank_account_number', 'bank_name', 'payment_ref','allowances','overtime','bonus','tax_deductions','pension_deductions']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // let's ensure employee exists
        $employee = $this->employeeModel->findById($data['employee_id']);
        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }
        // calculate net pay
        $data['net_pay'] = $data['base_salary'] + $data['allowances'] + $data['overtime'] + $data['bonus'] - $data['tax_deductions'] - $data['pension_deductions'] - $data['other_deductions'];
        $created = $this->payrollModel->createPayroll($data);
        $this->jsonResponse(['message' => 'Payroll record created successfully', 'data' => $created], 201);

    }
    // update payroll record
    public function updatePayroll($id)
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
        $payrollRecord = $this->payrollModel->findById($id);
        if (!$payrollRecord) {
            $this->jsonResponse(['error' => 'Payroll record not found'], 404);
        }
        // validate the data before updating the payroll record
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'base_salary', 'pay_date', 'payment_start_date', 'bank_account_number', 'bank_name', 'payment_ref','other_deductions','allowances','overtime','bonus','tax_deductions','pension_deductions']);
        if($validation){
            $this->jsonResponse(['status'=>false,'error'=>$validation]);
        }
        $updatedata = $this->payrollModel->updatePayroll($id, $data);
        $this->jsonResponse(['status'=>true,'message'=>'Updated','data'=>$updatedata]);
    }

    public function deletePayroll($id)
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
        $payroll = $this->payrollModel->findById($id);
        if (!$payroll) {
            $this->jsonResponse(['error' => 'Payroll not found'], 404);
        }
        $deleted = $this->payrollModel->deletePayroll($id);
        $this->jsonResponse(['message' => 'Deleted successfully', 'data' => $deleted], 200);
    }
}