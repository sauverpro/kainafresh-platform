<?php

class CustomerController extends BaseController
{
    private $customerModel;

    public function __construct()
    {
        $this->customerModel = new Customer();
    }

    /**
     * GET /api/customers
     */
    public function index()
    {
        $customers = $this->customerModel->allCustomers();

        $this->jsonResponse([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * GET /api/customers/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid customer ID'
            ], 422);

            return;
        }

        $customer = $this->customerModel->findCustomer($id);

        if (!$customer) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * POST /api/customers
     */
    public function store()
    {
        $data = $this->getRequestData();

        /*
         * Validate required fields
         */
        $validation = $this->validateRequired(
            $data,
            [
                'first_name',
                'last_name',
                'phone'
            ]
        );

        if ($validation) {
            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);

            return;
        }

        /*
         * Validate first name
         */
        if (trim($data['first_name']) === '') {
            $this->jsonResponse([
                'success' => false,
                'message' => 'First name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate last name
         */
        if (trim($data['last_name']) === '') {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Last name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate phone
         */
        if (trim($data['phone']) === '') {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Phone number cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate email if provided
         */
        if (
            isset($data['email']) &&
            trim($data['email']) !== '' &&
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid email address'
            ], 422);

            return;
        }

        /*
         * Normalize values
         */
        $data['first_name'] = trim($data['first_name']);
        $data['last_name'] = trim($data['last_name']);
        $data['phone'] = trim($data['phone']);

        if (isset($data['email'])) {
            $data['email'] = trim($data['email']);

            if ($data['email'] === '') {
                $data['email'] = null;
            }
        }

        if (isset($data['address'])) {
            $data['address'] = trim($data['address']);

            if ($data['address'] === '') {
                $data['address'] = null;
            }
        }

        /*
         * Create customer
         */
        $customer = $this->customerModel->create($data);

        if (!$customer) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create customer'
            ], 500);

            return;
        }

        /*
         * Return newly created customer
         */
        $customer = $this->customerModel->findCustomer(
            $customer['id']
        );

        $this->jsonResponse([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer
        ], 201);
    }

    /**
     * PUT /api/customers/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid customer ID'
            ], 422);

            return;
        }

        /*
         * Check customer exists
         */
        $existingCustomer = $this->customerModel->findCustomer($id);

        if (!$existingCustomer) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);

            return;
        }

        $data = $this->getRequestData();

        /*
         * Prevent empty update
         */
        if (empty($data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);

            return;
        }

        /*
         * Validate first name
         */
        if (
            isset($data['first_name']) &&
            trim($data['first_name']) === ''
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'First name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate last name
         */
        if (
            isset($data['last_name']) &&
            trim($data['last_name']) === ''
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Last name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate phone
         */
        if (
            isset($data['phone']) &&
            trim($data['phone']) === ''
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Phone number cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate email
         */
        if (
            isset($data['email']) &&
            trim($data['email']) !== '' &&
            !filter_var($data['email'], FILTER_VALIDATE_EMAIL)
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid email address'
            ], 422);

            return;
        }

        /*
         * Normalize values
         */
        if (isset($data['first_name'])) {
            $data['first_name'] = trim($data['first_name']);
        }

        if (isset($data['last_name'])) {
            $data['last_name'] = trim($data['last_name']);
        }

        if (isset($data['phone'])) {
            $data['phone'] = trim($data['phone']);
        }

        if (isset($data['email'])) {
            $data['email'] = trim($data['email']);

            if ($data['email'] === '') {
                $data['email'] = null;
            }
        }

        if (isset($data['address'])) {
            $data['address'] = trim($data['address']);

            if ($data['address'] === '') {
                $data['address'] = null;
            }
        }

        /*
         * Update customer
         */
        $updated = $this->customerModel->update($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update customer'
            ], 500);

            return;
        }

        /*
         * Return updated customer
         */
        $customer = $this->customerModel->findCustomer($id);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $customer
        ]);
    }

    /**
     * DELETE /api/customers/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        if ($id <= 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid customer ID'
            ], 422);

            return;
        }

        /*
         * Check customer exists
         */
        $existingCustomer = $this->customerModel->findCustomer($id);

        if (!$existingCustomer) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Customer not found'
            ], 404);

            return;
        }

        /*
         * Delete customer
         */
        if (!$this->customerModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete customer'
            ], 500);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Customer deleted successfully'
        ]);
    }
}
