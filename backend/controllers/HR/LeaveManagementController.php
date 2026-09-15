<?php

class LeaveManagementController extends BaseController
{
    protected $leaveManagementModel;
    protected $userModel;
    protected $employeeModel;
    public function __construct()
    {
        $this->leaveManagementModel = new LeaveManagement();
        $this->userModel = new User();
        $this->employeeModel = new EmployeeProfile();
    }

    // create leave request
    public function createLeaveRequest()
    {
        // validate the data before creating the leave request
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['employee_id', 'leave_type', 'start_date', 'end_date', 'leave_reason', 'leave_duration']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // let's ensure employee exists
        $employee = $this->employeeModel->findById($data['employee_id']);
        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }

        $created = $this->leaveManagementModel->createLeaveRequest($data);
        $this->jsonResponse(['message' => 'Leave request created successfully', 'data' => $created], 201);
    }

    // accept leave request
    public function acceptLeaveRequest($id)
    {
        $leaveRequest = $this->leaveManagementModel->findById($id);
        if (!$leaveRequest) {
            $this->jsonResponse(['error' => 'Leave request not found'], 404);
        }
        $updated = $this->leaveManagementModel->acceptLeaveRequest($id);
        $this->jsonResponse(['message' => 'Leave request accepted successfully', 'data' => $updated], 200);
    }

    // reject leave request
   
}