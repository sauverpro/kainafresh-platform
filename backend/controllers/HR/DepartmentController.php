<?php

class DepartmentController extends BaseController
{
    private $departmentModel;

    public function __construct()
    {
        $this->departmentModel = new Department();
    }

    /**
     * GET /api/departments
     */
    public function index()
    {
        $departments = $this->departmentModel->allDepartments();

        $this->jsonResponse([
            'success' => true,
            'data' => $departments
        ]);
    }

    /**
     * GET /api/departments/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid department ID'
            ], 422);
        }

        $department = $this->departmentModel->findDepartment($id);

        if (!$department) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $department
        ]);
    }

    /**
     * POST /api/departments
     */
    public function store()
    {
        $data = $this->getRequestData();

        $name = trim($data['name'] ?? '');

        if ($name === '') {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department name is required'
            ], 422);
        }

        $hodEmail = trim($data['HOD_email'] ?? '');

        if ($hodEmail !== '' && !filter_var($hodEmail, FILTER_VALIDATE_EMAIL)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'HOD_email must be a valid email address'
            ], 422);
        }

        $payload = [
            'name' => $name,
            'dept_code' => $this->generateDeptCode($name),
            'HOD_name' => trim($data['HOD_name'] ?? '') ?: null,
            'HOD_email' => $hodEmail ?: null,
            'Dep_description' => trim($data['Dep_description'] ?? '') ?: null,
        ];

        $department = $this->departmentModel->createDepartment($payload);

        if (!$department) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create department'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => $department
        ], 201);
    }

    /**
     * PUT /api/departments/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid department ID'
            ], 422);
        }

        if (!$this->departmentModel->findDepartment($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $data = $this->getRequestData();

        // dept_code is generated once at creation time and never changes.
        unset($data['dept_code']);

        $payload = [];

        if (isset($data['name'])) {
            $name = trim($data['name']);

            if ($name === '') {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Department name is required'
                ], 422);
            }

            $payload['name'] = $name;
        }

        if (isset($data['HOD_name'])) {
            $payload['HOD_name'] = trim($data['HOD_name']) ?: null;
        }

        if (isset($data['HOD_email'])) {
            $hodEmail = trim($data['HOD_email']);

            if ($hodEmail !== '' && !filter_var($hodEmail, FILTER_VALIDATE_EMAIL)) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'HOD_email must be a valid email address'
                ], 422);
            }

            $payload['HOD_email'] = $hodEmail ?: null;
        }

        if (isset($data['Dep_description'])) {
            $payload['Dep_description'] = trim($data['Dep_description']) ?: null;
        }

        if (empty($payload)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);
        }

        if (!$this->departmentModel->updateDepartment($id, $payload)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update department'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Department updated successfully',
            'data' => $this->departmentModel->findDepartment($id)
        ]);
    }

    /**
     * DELETE /api/departments/{id}
     */
    public function delete($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid department ID'
            ], 422);
        }

        if (!$this->departmentModel->findDepartment($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        if (!$this->departmentModel->deleteDepartment($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete department'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);
    }

    /**
     * Generate a unique department code, e.g. "IT Department" -> "KF-DID-482".
     */
    private function generateDeptCode($name)
    {
        $initials = '';

        foreach (preg_split('/\s+/', trim($name)) as $word) {
            $word = preg_replace('/[^A-Za-z]/', '', $word);

            if ($word !== '') {
                $initials .= strtoupper($word[0]);
            }
        }

        if ($initials === '') {
            $initials = 'X';
        }

        do {
            $random = str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT);
            $code = "KF-D{$initials}-{$random}";
        } while ($this->departmentModel->codeExists($code));

        return $code;
    }
}
