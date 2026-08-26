<?php

class OrderItemController extends BaseController
{
    private $orderItemModel;

    public function __construct()
    {
        $this->orderItemModel = new OrderItem();
    }

    /**
     * GET /api/order-items
     */
    public function index()
    {
        $items = $this->orderItemModel->allWithProduct();

        $this->jsonResponse([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * GET /api/order-items/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        $item = $this->orderItemModel->findWithProduct($id);

        if (!$item) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order item not found'
            ], 404);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $item
        ]);
    }

    /**
     * GET /api/orders/{orderId}/items
     */
    public function indexByOrder($orderId)
    {
        $orderId = (int) $orderId;

        if (!$this->orderItemModel->orderExists($orderId)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

            return;
        }

        $items = $this->orderItemModel->findByOrder($orderId);

        $this->jsonResponse([
            'success' => true,
            'data' => $items
        ]);
    }

    /**
     * POST /api/orders/{orderId}/items
     */
    public function store($orderId)
    {
        $orderId = (int) $orderId;

        if (!$this->orderItemModel->orderExists($orderId)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

            return;
        }

        $data = $this->getRequestData();

        $validation = $this->validateRequired(
            $data,
            [
                'product_id',
                'quantity'
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
         * Validate product.
         */
        $productId = (int) $data['product_id'];

        if (
            $productId <= 0 ||
            !$this->orderItemModel->productExists($productId)
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid product'
            ], 422);

            return;
        }

        /*
         * Validate quantity.
         */
        if (
            !is_numeric($data['quantity']) ||
            (float) $data['quantity'] <= 0
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Quantity must be greater than zero'
            ], 422);

            return;
        }

        $quantity = (float) $data['quantity'];

        /*
         * Get current product price.
         */
        $product = $this->orderItemModel->getProductPrice($productId);

        if (!$product) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Product not found'
            ], 404);

            return;
        }

        $unitPrice = (float) $product['price'];

        /*
         * Calculate subtotal on the backend.
         */
        $subtotal = $quantity * $unitPrice;

        $itemData = [
            'order_id' => $orderId,
            'product_id' => $productId,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal
        ];

        $item = $this->orderItemModel->create($itemData);

        if (!$item) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create order item'
            ], 500);

            return;
        }

        $item = $this->orderItemModel->findWithProduct($item['id']);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order item created successfully',
            'data' => $item
        ], 201);
    }

    /**
     * PUT /api/order-items/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingItem = $this->orderItemModel->find($id);

        if (!$existingItem) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order item not found'
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
         * Product can be changed.
         */
        if (isset($data['product_id'])) {
            $productId = (int) $data['product_id'];

            if (
                $productId <= 0 ||
                !$this->orderItemModel->productExists($productId)
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid product'
                ], 422);

                return;
            }

            $data['product_id'] = $productId;
        } else {
            $productId = (int) $existingItem['product_id'];
        }

        /*
         * Quantity.
         */
        if (isset($data['quantity'])) {
            if (
                !is_numeric($data['quantity']) ||
                (float) $data['quantity'] <= 0
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Quantity must be greater than zero'
                ], 422);

                return;
            }

            $data['quantity'] = (float) $data['quantity'];
        } else {
            $data['quantity'] = (float) $existingItem['quantity'];
        }

        /*
         * Always get the current product price.
         *
         * This keeps the item price controlled by the backend.
         */
        $product = $this->orderItemModel->getProductPrice($productId);

        if (!$product) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Product not found'
            ], 404);

            return;
        }

        $data['unit_price'] = (float) $product['price'];

        /*
         * Recalculate subtotal.
         */
        $data['subtotal'] =
            $data['quantity'] * $data['unit_price'];

        /*
         * Update.
         */
        $updated = $this->orderItemModel->update($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update order item'
            ], 500);

            return;
        }

        $item = $this->orderItemModel->findWithProduct($id);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order item updated successfully',
            'data' => $item
        ]);
    }

    /**
     * DELETE /api/order-items/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingItem = $this->orderItemModel->find($id);

        if (!$existingItem) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Order item not found'
            ], 404);

            return;
        }

        if (!$this->orderItemModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete order item'
            ], 500);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Order item deleted successfully'
        ]);
    }
}
