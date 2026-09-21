<?php

class OrderController extends BaseController
{
    
    protected $orderModel;
    protected $userModel;
    protected $customerModel;
    protected $orderItemModel;
    public function __construct()
    {
        $this->orderModel = new Order();
        $this->userModel = new User();
        $this->customerModel = new Customer();
        $this->orderItemModel = new OrderItem();
    }

    /**
     * GET /api/orders
     */
    public function index()
    {
         // get user id
     $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
    //   check if user is admin or sales_manager
      if ($user['role'] !== 'admin' && $user['role'] !== 'sales_manager') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unathorized access.'
            ]);
            return;
      }
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
         // get user id
     $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
    //   check if user is admin or sales_manager
      if ($user['role'] !== 'admin' && $user['role'] !== 'sales_manager') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unathorized access.'
            ]);
            return;
      }
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

    public function showorder($id)
    {
        $order = $this->orderModel->findWithRelationsOrderId($id);

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
        $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
        $data = $this->getRequestData();

        /*
         * Required fields
         */
        $validation = $this->validateRequired(
            $data,
            [
               
                'total',
                'orderId'
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
        $userId = (int) $userid;

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
        // get customer id by using user_id 

        $customer = $this->customerModel->findCustomerByUserId($userid);
        if (
            $customer['id'] !== ''
        ) {
            $customerId = (int) $customer['id'];

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
        $data['orderId'] = $data['orderId'];

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
 // ---- Send emails (best effort) ----
        try {
            require_once __DIR__ . '/../../services/MailTemplates.php';

              $orderItems = $this->orderItemModel->findByOrder($order['id']);

              $customer = !empty($order['customer_id'])
                ? $this->customerModel->findCustomer($order['customer_id'])
                : null;

            $orderForEmail = array_merge($order, [
                'customer_first_name' => $customer['first_name'] ?? '',
                'customer_last_name'  => $customer['last_name']  ?? '',
                'customer_phone'      => $customer['phone']      ?? '',
                'customer_email'      => $customer['email']      ?? '',
                'customer_address'    => $customer['address']    ?? '',
            ]);

            $config = require __DIR__ . '/../../config/mail.php';
            $mailer = new MailTemplates($config);

            if (!empty($orderForEmail['customer_email'])) {
                $mailer->sendOrderConfirmationToCustomer(
                    $orderForEmail, $orderItems, $orderForEmail['customer_email']
                );
            }

            $mailer->sendOrderConfirmationToAdmin(
                $orderForEmail,
                $orderItems,
                ['orders@kainafresh.rw' => 'Kaina Fresh Team']
            );
        } catch (Throwable $e) {
            error_log('[Order email dispatch] ' . $e->getMessage());
        }
        // ---- end email block ----
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
         // get user id
     $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
    //   check if user is admin or sales_manager
      if ($user['role'] !== 'admin' && $user['role'] !== 'sales_manager') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unathorized access.'
            ]);
            return;
      }
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
         // get user id
     $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
    //   check if user is admin or sales_manager
      if ($user['role'] !== 'admin' && $user['role'] !== 'sales_manager') {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Unathorized access.'
            ]);
            return;
      }
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

    // get customer order
    public function CustomerOrder(){
           // get user id
           
      $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
      $orders = $this->orderModel->findWithRelationsOrderCustomer($userid);

      if($orders){
        $this->jsonResponse([
                'success' => true,
                'message' => 'Order retrieved!',
                'data'=>$orders
            ], 200);

      }
      else{
        $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to retrieve order'
            ], 500);

      }
    }

    public function CustomerOrderCancel($id){
        $userid = $this->getAuthenticatedUserId();
      $user = $this->userModel->findByUserId($userid);
      if (!$user) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'You must be logged in'
            ]);
            return;
      }
      if($this->orderModel->CancelOrder($id)){
      $this->jsonResponse(['status'=>true,'message'=>'Order Cancelled'],200);
      }
      else{
        $this->jsonResponse(['status'=>false,'message'=>'Something went wrong'],500);
      }
    }
}
