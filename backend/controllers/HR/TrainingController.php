<?php

class TrainingController extends BaseController
{
    protected $trainingModel;
    protected $userModel;
    protected $employeeModel;

    public function __construct()
    {
        $this->trainingModel = new Training();
        $this->userModel = new User();
        $this->employeeModel = new EmployeeProfile();
    }

    /**
     * Create training record.
     */
    public function createTraining()
    {
        // Check if user is authenticated
        $user = $this->getAuthenticatedUserId();

        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }

        // Get request data
        $data = $this->getRequestData();

        // Validate required fields
        $validation = $this->validateRequired($data, [
            'emp_id',
            'training_name',
            'training_type',
            'start_date',
            'end_date',
            'duration_days',
            'cost',
            'status'
        ]);

        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }

        // Ensure employee exists
        $employee = $this->employeeModel->findById($data['emp_id']);

        if (!$employee) {
            $this->jsonResponse(['error' => 'Employee not found'], 404);
        }

        // Create training
        $created = $this->trainingModel->createTraining($data);

        if (!$created) {
            $this->jsonResponse([
                'error' => 'Failed to create training'
            ], 500);
        }

        $this->jsonResponse([
            'message' => 'Training created successfully',
            'data' => $created
        ], 201);
    }

    /**
     * Update training record.
     */
    public function updateTraining($id)
    {
        // Check if user is authenticated
        $user = $this->getAuthenticatedUserId();

        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }

        // Check if training exists
        $training = $this->trainingModel->findTraining($id);

        if (!$training) {
            $this->jsonResponse([
                'error' => 'Training not found'
            ], 404);
        }

        // Get request data
        $data = $this->getRequestData();

        // Validate required fields
        $validation = $this->validateRequired($data, [
            'emp_id',
            'training_name',
            'training_type',
            'start_date',
            'end_date',
            'duration_days',
            'cost',
            'status'
        ]);

        if ($validation) {
            $this->jsonResponse(['error' => $validation], 400);
        }

        // Ensure employee exists
        $employee = $this->employeeModel->findById($data['emp_id']);

        if (!$employee) {
            $this->jsonResponse([
                'error' => 'Employee not found'
            ], 404);
        }

        // Update training
        $updated = $this->trainingModel->updateTraining($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'error' => 'Failed to update training'
            ], 500);
        }

        $this->jsonResponse([
            'message' => 'Training updated successfully',
            'data' => $updated
        ], 200);
    }

    /**
     * Delete training record.
     */
    public function deleteTraining($id)
    {
        // Check if user is authenticated
        $user = $this->getAuthenticatedUserId();

        if (!$user) {
            $this->jsonResponse(['error' => 'Unauthorized'], 401);
        }

        // Check if user is admin, sales_manager or hr_manager
        $userData = $this->userModel->findByUserId($user);

        if (
            $userData['role'] !== 'admin' &&
            $userData['role'] !== 'sales_manager' &&
            $userData['role'] !== 'hr_manager'
        ) {
            $this->jsonResponse([
                'error' => 'Unauthorized'
            ], 403);
        }

        // Check if training exists
        $training = $this->trainingModel->findTraining($id);

        if (!$training) {
            $this->jsonResponse([
                'error' => 'Training not found'
            ], 404);
        }

        // Delete training
        $deleted = $this->trainingModel->deleteTraining($id);

        if (!$deleted) {
            $this->jsonResponse([
                'error' => 'Failed to delete training'
            ], 500);
        }

        $this->jsonResponse([
            'message' => 'Training deleted successfully',
            'data' => $deleted
        ], 200);
    }

    /**
     * Get all training records.
     */
    public function index()
    {
        // Check if user is authenticated
        $user = $this->getAuthenticatedUserId();

        if (!$user) {
            $this->jsonResponse([
                'error' => 'Unauthorized'
            ], 401);
        }

        // Get all trainings with employee information
        $trainings = $this->trainingModel->allTrainingsWithEmployees();

        $this->jsonResponse([
            'message' => 'Trainings retrieved successfully',
            'data' => $trainings
        ], 200);
    }

    /**
     * Get a single training record.
     */
    public function show($id)
    {
        // Check if user is authenticated
        $user = $this->getAuthenticatedUserId();

        if (!$user) {
            $this->jsonResponse([
                'error' => 'Unauthorized'
            ], 401);
        }

        // Find training
        $training = $this->trainingModel->findTrainingWithEmployee($id);

        if (!$training) {
            $this->jsonResponse([
                'error' => 'Training not found'
            ], 404);
        }

        $this->jsonResponse([
            'message' => 'Training retrieved successfully',
            'data' => $training
        ], 200);
    }
}
