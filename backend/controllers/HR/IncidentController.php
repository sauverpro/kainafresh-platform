<?php

class IncidentController extends BaseController
{
    protected $incidentModel;
    protected $userModel;
    protected $employeeModel;

    public function __construct()
    {
        $this->incidentModel = new Incident();
        $this->userModel = new User();
        $this->employeeModel = new EmployeeProfile();
    }

    /**
     * GET /api/incidents
     */
    public function index()
    {
        $userId = $this->getAuthenticatedUserId();

        if (!$userId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'You must login!'
            ], 401);
        }

        $incidents = $this->incidentModel->allWithDetails();

        $this->jsonResponse([
            'success' => true,
            'data' => $incidents
        ]);
    }

    /**
     * GET /api/incidents/{id}
     */
    public function show($id)
    {
        $userId = $this->getAuthenticatedUserId();

        if (!$userId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'You must login!'
            ], 401);
        }

        $id = (int) $id;

        $incident = $this->incidentModel->findWithDetails($id);

        if (!$incident) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Incident not found'
            ], 404);
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $incident
        ]);
    }

    /**
     * POST /api/incidents
     */
    public function store()
    {
        $userId = $this->getAuthenticatedUserId();

        if (!$userId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'You must login!'
            ], 401);
        }

        $data = $this->getRequestData();

        $validation = $this->validateRequired($data, [
            'emp_id',
            'incident_date',
            'incident_type',
            'severity',
            'description'
        ]);

        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);
        }

        $employee = $this->employeeModel->findById($data['emp_id']);

        if (!$employee) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        // The reporter is always the authenticated user, never a client-supplied value.
        

        $incident = $this->incidentModel->create($data);

        if (!$incident) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create incident'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Incident created successfully',
            'data' => $this->incidentModel->findWithDetails($incident['id'])
        ], 201);
    }

    /**
     * PUT /api/incidents/{id}
     */
    public function update($id)
    {
        $userId = $this->getAuthenticatedUserId();

        if (!$userId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'You must login!'
            ], 401);
        }

        $id = (int) $id;

        $existingIncident = $this->incidentModel->find($id);

        if (!$existingIncident) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Incident not found'
            ], 404);
        }

        $data = $this->getRequestData();

        if (empty($data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);
        }

        if (isset($data['emp_id'])) {
            $employee = $this->employeeModel->findById($data['emp_id']);

            if (!$employee) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Employee not found'
                ], 404);
            }
        }

        // The reporter can never be changed through this endpoint.
        unset($data['reported_by']);

        $updated = $this->incidentModel->update($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update incident'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Incident updated successfully',
            'data' => $this->incidentModel->findWithDetails($id)
        ]);
    }

    /**
     * DELETE /api/incidents/{id}
     */
    public function delete($id)
    {
        $userId = $this->getAuthenticatedUserId();

        if (!$userId) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'You must login!'
            ], 401);
        }

        $user = $this->userModel->findByUserId($userId);

        if (
            $user['role'] !== 'admin' &&
            $user['role'] !== 'sales_manager' &&
            $user['role'] !== 'hr_manager'
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $id = (int) $id;

        $existingIncident = $this->incidentModel->find($id);

        if (!$existingIncident) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Incident not found'
            ], 404);
        }

        if (!$this->incidentModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete incident'
            ], 500);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Incident deleted successfully'
        ]);
    }
}
