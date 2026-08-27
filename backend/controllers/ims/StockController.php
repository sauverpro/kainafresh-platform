<?php

class StockController extends BaseController
{
    private $stockModel;
    private $productModel;

    public function __construct()
    {
        $this->stockModel = new Stock();
        $this->productModel = new Product();
    }

    /**
     * GET /api/stocks
     */
    public function index()
    {
        $stocks = $this->stockModel->allWithProducts();

        $this->jsonResponse([
            'success' => true,
            'data' => $stocks
        ]);
    }

    /**
     * GET /api/stocks/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        $stock = $this->stockModel->findWithProduct($id);

        if (!$stock) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Stock not found'
            ], 404);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $stock
        ]);
    }

    /**
     * POST /api/stocks
     */
    public function store()
    {
        $data = $this->getRequestData();

        /*
         * Validate required fields.
         */
        $validation = $this->validateRequired(
            $data,
            [
                'productid',
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
        $productId = (int) $data['productid'];

        if (
            $productId <= 0 ||
            !$this->productModel->find($productId)
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
            (float) $data['quantity'] < 0
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Quantity must be a valid positive number'
            ], 422);

            return;
        }

        /*
         * Validate harvest date.
         */
        if (
            isset($data['harvest_date']) &&
            $data['harvest_date'] !== '' &&
            !$this->isValidDate($data['harvest_date'])
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid harvest date'
            ], 422);

            return;
        }

        /*
         * Validate pack date.
         */
        if (
            isset($data['pack_date']) &&
            $data['pack_date'] !== '' &&
            !$this->isValidDate($data['pack_date'])
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid pack date'
            ], 422);

            return;
        }

        /*
         * Normalize values.
         */
        $data['productid'] = $productId;
        $data['quantity'] = (float) $data['quantity'];

        /*
         * Create stock.
         */
        $stock = $this->stockModel->create($data);

        if (!$stock) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create stock'
            ], 500);

            return;
        }

        /*
         * Return stock with product information.
         */
        $stock = $this->stockModel->findWithProduct($stock['id']);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Stock created successfully',
            'data' => $stock
        ], 201);
    }

    /**
     * PUT /api/stocks/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingStock = $this->stockModel->find($id);

        if (!$existingStock) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Stock not found'
            ], 404);

            return;
        }

        $data = $this->getRequestData();

        /*
         * Validate product if provided.
         */
        if (isset($data['productid'])) {
            $productId = (int) $data['productid'];

            if (
                $productId <= 0 ||
                !$this->productModel->find($productId)
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid product'
                ], 422);

                return;
            }

            $data['productid'] = $productId;
        }

        /*
         * Validate quantity if provided.
         */
        if (isset($data['quantity'])) {
            if (
                !is_numeric($data['quantity']) ||
                (float) $data['quantity'] < 0
            ) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Quantity must be a valid positive number'
                ], 422);

                return;
            }

            $data['quantity'] = (float) $data['quantity'];
        }

        /*
         * Validate harvest date if provided.
         */
        if (
            isset($data['harvest_date']) &&
            $data['harvest_date'] !== '' &&
            !$this->isValidDate($data['harvest_date'])
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid harvest date'
            ], 422);

            return;
        }

        /*
         * Validate pack date if provided.
         */
        if (
            isset($data['pack_date']) &&
            $data['pack_date'] !== '' &&
            !$this->isValidDate($data['pack_date'])
        ) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid pack date'
            ], 422);

            return;
        }

        /*
         * Prevent an empty update.
         */
        if (empty($data)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'No data provided for update'
            ], 422);

            return;
        }

        /*
         * Update stock.
         */
        $updated = $this->stockModel->update($id, $data);

        if (!$updated) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update stock'
            ], 500);

            return;
        }

        /*
         * Return updated stock with product information.
         */
        $stock = $this->stockModel->findWithProduct($id);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Stock updated successfully',
            'data' => $stock
        ]);
    }

    /**
     * DELETE /api/stocks/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingStock = $this->stockModel->find($id);

        if (!$existingStock) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Stock not found'
            ], 404);

            return;
        }

        /*
         * Delete database record.
         */
        if (!$this->stockModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete stock'
            ], 500);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Stock deleted successfully'
        ]);
    }

    /**
     * Validate YYYY-MM-DD date.
     */
    private function isValidDate($date)
    {
        $parsed = DateTime::createFromFormat('Y-m-d', $date);

        return $parsed &&
            $parsed->format('Y-m-d') === $date;
    }
}
