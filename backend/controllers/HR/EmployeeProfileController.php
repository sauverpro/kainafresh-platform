<?php

class EmployeeProfileController extends BaseController
{
    private $employeeModel;
    private $departmentModel;

    private $allowedValues = [
        'gender' => ['male', 'female', 'other'],
        'employment_type' => ['full_time', 'part_time', 'contract', 'internship', 'casual'],
        'status' => ['active', 'inactive', 'on_leave', 'suspended', 'terminated'],
        'probation_status' => ['on_probation', 'confirmed', 'extended', 'failed'],
    ];

    private $dateFields = [
        'dob',
        'date_hired',
        'probation_end_date',
        'contract_end_date',
        'termination_date',
    ];

    public function __construct()
    {
        $this->employeeModel = new EmployeeProfile();
        $this->departmentModel = new Department();
    }

    /**
     * GET /api/employees
     * Optional query params: status, dept_id, employment_type, search
     */
    public function index()
    {
        $filters = [
            'status' => trim($_GET['status'] ?? ''),
            'dept_id' => trim($_GET['dept_id'] ?? ''),
            'employment_type' => trim($_GET['employment_type'] ?? ''),
            'search' => trim($_GET['search'] ?? ''),
        ];

        $employees = $this->employeeModel->allEmployees($filters);

        $this->jsonResponse([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * GET /api/employees/{id}
     */
    public function show($id)
    {
        $id = $this->validateId($id);

        $employee = $this->employeeModel->findEmployee($id);

        if (!$employee) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $employee
        ]);
    }

    /**
     * POST /api/employees
     */
    public function store()
    {
        $data = $this->normalize($this->getRequestData());

        if (empty($data['fullname'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Full name is required'
            ], 422);
        }

        if (empty($data['emp_number'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee number is required'
            ], 422);
        }

        $this->validate($data);

        if (!isset($data['status'])) {
            $data['status'] = 'active';
        }

        $employeeId = $this->employeeModel->createEmployee($data);

        if (!$employeeId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create employee'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => $this->employeeModel->findEmployee($employeeId)
        ], 201);
    }

    /**
     * PUT /api/employees/{id}
     * Only the fields sent in the request are updated.
     */
    public function update($id)
    {
        $id = $this->validateId($id);

        if (!$this->employeeModel->findEmployee($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $data = $this->normalize($this->getRequestData());

        if (empty($data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);
        }

        if (array_key_exists('fullname', $data) && empty($data['fullname'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Full name cannot be empty'
            ], 422);
        }

        if (array_key_exists('emp_number', $data) && empty($data['emp_number'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee number cannot be empty'
            ], 422);
        }

        if (array_key_exists('status', $data) && empty($data['status'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Status cannot be empty'
            ], 422);
        }

        $this->validate($data, $id);

        if (!$this->employeeModel->updateEmployee($id, $data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update employee'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Employee updated successfully',
            'data' => $this->employeeModel->findEmployee($id)
        ]);
    }

    /**
     * DELETE /api/employees/{id}
     */
    public function delete($id)
    {
        $id = $this->validateId($id);

        if (!$this->employeeModel->findEmployee($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        if (!$this->employeeModel->deleteEmployee($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete employee'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Employee deleted successfully'
        ]);
    }

    /**
     * Keep only known columns, trim strings and turn empty strings into null.
     */
    private function normalize($data)
    {
        $fields = [
            'fullname', 'emp_number', 'dob', 'gender', 'nid', 'phone', 'email',
            'address', 'dept_id', 'job_title', 'date_hired', 'employment_type',
            'emergency_person_name', 'emergency_phone_number', 'supervisor',
            'status', 'probation_end_date', 'probation_status', 'probation_notes',
            'appointment_letter_ref', 'contract_ref', 'contract_end_date',
            'termination_date', 'termination_reason',
        ];

        $clean = [];

        foreach ($fields as $field) {
            if (!array_key_exists($field, $data)) {
                continue;
            }

            $value = is_string($data[$field]) ? trim($data[$field]) : $data[$field];

            $clean[$field] = ($value === '' || $value === null) ? null : $value;
        }

        if (isset($clean['dept_id'])) {
            $clean['dept_id'] = (int) $clean['dept_id'];
        }

        foreach (array_keys($this->allowedValues) as $field) {
            if (isset($clean[$field])) {
                $clean[$field] = strtolower($clean[$field]);
            }
        }

        return $clean;
    }

    /**
     * Validate formats, allowed values, uniqueness and department.
     * Sends a 422/409 response and stops on the first error.
     */
    private function validate($data, $excludeId = null)
    {
        if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid email address'
            ], 422);
        }

        foreach ($this->dateFields as $field) {
            if (isset($data[$field]) && !$this->isValidDate($data[$field])) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => "The {$field} field must be a valid date (YYYY-MM-DD)"
                ], 422);
            }
        }

        foreach ($this->allowedValues as $field => $allowed) {
            if (isset($data[$field]) && !in_array($data[$field], $allowed, true)) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => "The {$field} field must be one of: " . implode(', ', $allowed)
                ], 422);
            }
        }

        if (isset($data['dept_id']) && !$this->departmentModel->findDepartment($data['dept_id'])) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department not found'
            ], 422);
        }

        if (isset($data['emp_number']) && $this->employeeModel->valueExists('emp_number', $data['emp_number'], $excludeId)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee number already exists'
            ], 409);
        }

        if (isset($data['nid']) && $this->employeeModel->valueExists('nid', $data['nid'], $excludeId)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'National ID already exists'
            ], 409);
        }
    }

    private function isValidDate($value)
    {
        $date = DateTime::createFromFormat('Y-m-d', $value);

        return $date && $date->format('Y-m-d') === $value;
    }

    private function validateId($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid employee ID'
            ], 422);
        }

        return $id;
    }
}
