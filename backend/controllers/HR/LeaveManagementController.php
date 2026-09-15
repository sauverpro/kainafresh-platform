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
        // check if user is authorized to update leave request
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
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

    // check if user is authorized to accept leave request
    $user = $this->getAuthenticatedUserId();
    if (!$user) {
        $this->jsonResponse(['error' => 'Unauthorized'], 401);
    }
    // check if user is admin, sales_manager or hr_manager
      $userData = $this->userModel->findByUserId($user);
    if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
        $this->jsonResponse(['error' => 'Unauthorized'], 403);
    }
        $leaveRequest = $this->leaveManagementModel->findById($id);
        if (!$leaveRequest) {
            $this->jsonResponse(['error' => 'Leave request not found'], 404);
        }
        $updated = $this->leaveManagementModel->acceptLeaveRequest($id);
        $this->jsonResponse(['message' => 'Leave request accepted successfully', 'data' => $updated], 200);
    }

    // reject leave request
    public function rejectLeaveRequest($id)
    {
    // check if user is authorized to reject leave request
    $user = $this->getAuthenticatedUserId();
    if (!$user) {
        $this->jsonResponse(['error' => 'Unauthorized'], 401);
    }
    // check if user is admin, sales_manager or hr_manager
      $userData = $this->userModel->findByUserId($user);
    if ($userData['role'] !== 'admin' && $userData['role'] !== 'sales_manager' && $userData['role'] !== 'hr_manager') {
        $this->jsonResponse(['error' => 'Unauthorized'], 403);
    }
        $leaveRequest = $this->leaveManagementModel->findById($id);
        if (!$leaveRequest) {
            $this->jsonResponse(['error' => 'Leave request not found'], 404);
        }
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['reject_reason']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        $updated = $this->leaveManagementModel->rejectLeaveRequest($id, $data['reject_reason']);
        $this->jsonResponse(['message' => 'Leave request rejected successfully', 'data' => $updated], 200);

    }
//  delete leave request
    public function deleteLeaveRequest($id)
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
        $leaveRequest = $this->leaveManagementModel->findById($id);
        if (!$leaveRequest) {
            $this->jsonResponse(['error' => 'Leave request not found'], 404);
        }
        $deleted = $this->leaveManagementModel->deleteLeaveRequest($id);
        $this->jsonResponse(['message' => 'Leave request deleted successfully', 'data' => $deleted], 200);
    } 
    // update leave request
    public function updateLeaveRequest($id)
    {
        // check if user is authorized to update leave request
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }

        // validate the data before updating the leave request
        $data = $this->getRequestData();
        $validation = $this->validateRequired($data, ['leave_type', 'start_date', 'end_date', 'leave_reason', 'leave_duration']);
        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }
        // check if leave request exists
        $leaveRequest = $this->leaveManagementModel->findById($id);
        if (!$leaveRequest) {
            $this->jsonResponse(['error' => 'Leave request not found'], 404);
        }
        $updated = $this->leaveManagementModel->updateLeaveRequest($id, $data);
        $this->jsonResponse(['message' => 'Leave request updated successfully', 'data' => $updated], 200);
    }
    // get all leave requests
    public function index()
    {
        // check if user is authorized to view leave requests
        $user = $this->getAuthenticatedUserId();
        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }
        $leaveRequests = $this->leaveManagementModel->findAll();
        $this->jsonResponse(['message' => 'Leave requests retrieved successfully', 'data' => $leaveRequests], 200);
    } 
}