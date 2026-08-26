<?php

class OrderController extends BaseController
{
    private $orderModel;

    public function __construct()
    {
        $this->orderModel = new Order();
    }

    /**
     * GET /api/orders
     */
    public function index()
    {
        $orders = $this->orderModel->allWithRelations();

        $this->jsonResponse([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * GET /api/orders/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        $order = $this->orderModel->findWithRelations($id);

        if (!$order) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * POST /api/orders
     */
    public function store()
    {
        $data = $this->getRequestData();

        /*
         * Required fields
         */
        $validation = $this->validateRequired(
            $data,
            [
                'user_id',
                'total'
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
         * Validate user
         */
        $userId = (int) $data['user_id'];

        if ($userId <= 0 || !$this->orderModel->userExists($userId)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid user'
            ], 422);

            return;
        }

        /*
         * Validate optional customer
         */
        if (
            isset($data['customer_id']) &&
            $data['customer_id'] !== null &&
            $data['customer_id'] !== ''
        ) {
            $customerId = (int) $data['customer_id'];

            if (
                $customerId <= 0 ||
                !$this->orderModel->customerExists($customerId)
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid customer'
                ], 422);

                return;
            }

            $data['customer_id'] = $customerId;
        } else {
            $data['customer_id'] = null;
        }

        /*
         * Validate total
         */
        if (!is_numeric($data['total']) || (float) $data['total'] < 0) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Total must be a valid positive number'
            ], 422);

            return;
        }

        /*
         * Validate status
         */
        $data['status'] = $data['status'] ?? 'pending';

        /*
         * Validate order source
         */
        $data['order_source'] = $data['order_source'] ?? 'ecommerce';

        if (!in_array(
            $data['order_source'],
            ['ecommerce', 'externalorder'],
            true
        )) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid order source'
            ], 422);

            return;
        }

        /*
         * Order date
         */
        if (empty($data['order_date'])) {
            $data['order_date'] = date('Y-m-d H:i:s');
        }

        /*
         * Normalize
         */
        $data['user_id'] = $userId;
        $data['total'] = (float) $data['total'];

        /*
         * Create order
         */
        $order = $this->orderModel->create($data);

        if (!$order) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create order'
            ], 500);

            return;
        }

        $order = $this->orderModel->findWithRelations($order['id']);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order created successfully',
            'data' => $order
        ], 201);
    }

    /**
     * PUT /api/orders/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingOrder = $this->orderModel->find($id);

        if (!$existingOrder) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

            return;
        }

        $data = $this->getRequestData();

        if (empty($data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);

            return;
        }

        /*
         * Validate user if provided
         */
        if (isset($data['user_id'])) {
            $userId = (int) $data['user_id'];

            if (
                $userId <= 0 ||
                !$this->orderModel->userExists($userId)
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid user'
                ], 422);

                return;
            }

            $data['user_id'] = $userId;
        }

        /*
         * Validate customer if provided
         */
        if (array_key_exists('customer_id', $data)) {
            if (
                $data['customer_id'] === null ||
                $data['customer_id'] === ''
            ) {
                $data['customer_id'] = null;
            } else {
                $customerId = (int) $data['customer_id'];

                if (
                    $customerId <= 0 ||
                    !$this->orderModel->customerExists($customerId)
                ) {
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Invalid customer'
                    ], 422);

                    return;
                }

                $data['customer_id'] = $customerId;
            }
        }

        /*
         * Validate total
         */
        if (isset($data['total'])) {
            if (
                !is_numeric($data['total']) ||
                (float) $data['total'] < 0
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Total must be a valid positive number'
                ], 422);

                return;
            }

            $data['total'] = (float) $data['total'];
        }

        /*
         * Validate order source
         */
        if (isset($data['order_source'])) {
            if (!in_array(
                $data['order_source'],
                ['ecommerce', 'externalorder'],
                true
            )) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid order source'
                ], 422);

                return;
            }
        }

        /*
         * Update order
         */
        $updated = $this->orderModel->update($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update order'
            ], 500);

            return;
        }

        $order = $this->orderModel->findWithRelations($id);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }

    /**
     * DELETE /api/orders/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingOrder = $this->orderModel->find($id);

        if (!$existingOrder) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

            return;
        }

        if (!$this->orderModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete order'
            ], 500);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }
}
