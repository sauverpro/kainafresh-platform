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

        $departmentId = $this->departmentModel->createDepartment([
            'name' => $name
        ]);

        if (!$departmentId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create department'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => $this->departmentModel->findDepartment($departmentId)
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

        $data = $this->getRequestData();

        $name = trim($data['name'] ?? '');

        if ($name === '') {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department name is required'
            ], 422);
        }

        if (!$this->departmentModel->findDepartment($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        if (!$this->departmentModel->updateDepartment($id, ['name' => $name])) {
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
}
