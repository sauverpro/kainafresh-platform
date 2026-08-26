<?php

class ProductController extends BaseController
{
    private $productModel;
    private $unitModel;

    public function __construct()
    {
        $this->productModel = new Product();
        $this->unitModel = new Unit();
    }

    /**
     * GET /api/products
     */
    public function index()
    {
        $products = $this->productModel->allWithUnits();

        $this->jsonResponse([
            'success' => true,
            'data' => $products
        ]);
    }

    /**
     * GET /api/products/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        $product = $this->productModel->findWithUnit($id);

        if (!$product) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Product not found'
            ], 404);

            return;
        }

        $this->jsonResponse([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * POST /api/products
     *
     * Supports multipart/form-data because product_image is a file.
     */
    public function store()
    {
       if (!empty($_POST)) {
    $data = $_POST;
} else {
    $data = $this->getRequestData();
}

        /*
         * Product image
         */
        $uploadedImage = null;

        if (isset($_FILES['product_image'])) {
            $uploadHelper = new UploadHelper();

            try {
                $uploadedImage = $uploadHelper->upload(
                    $_FILES['product_image'],
                    'products'
                );

                $data['product_image'] = $uploadedImage['path'];
            } catch (Exception $e) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 422);

                return;
            }
        }

        /*
         * Validate required fields
         */
        $validation = $this->validateRequired(
            $data,
            [
                'name',
                'unit_id',
                'shelf_life',
                'price'
            ]
        );

        if ($validation) {
            // If validation fails after an image was uploaded,
            // remove the uploaded image.
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => $validation
            ], 422);

            return;
        }

        /*
         * Validate name
         */
        if (trim($data['name']) === '') {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Product name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate unit
         */
        $unitId = (int) $data['unit_id'];

        if ($unitId <= 0 || !$this->unitModel->find($unitId)) {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid unit'
            ], 422);

            return;
        }

        /*
         * Validate shelf life
         */
        if (
            !is_numeric($data['shelf_life']) ||
            (int) $data['shelf_life'] < 0
        ) {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Shelf life must be a valid number of days'
            ], 422);

            return;
        }

        /*
         * Validate price
         */
        if (
            !is_numeric($data['price']) ||
            (float) $data['price'] < 0
        ) {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Price must be a valid positive number'
            ], 422);

            return;
        }

        /*
         * Default status
         */
        $data['status'] = $data['status'] ?? 'active';

        if (!in_array($data['status'], ['active', 'inactive'], true)) {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid product status'
            ], 422);

            return;
        }

        /*
         * Normalize values
         */
        $data['unit_id'] = $unitId;
        $data['shelf_life'] = (int) $data['shelf_life'];
        $data['price'] = (float) $data['price'];

        /*
         * Create product
         */
        $product = $this->productModel->create($data);

        if (!$product) {
            // Database creation failed, remove uploaded image.
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to create product'
            ], 500);

            return;
        }

        /*
         * Return product together with unit information
         */
        $product = $this->productModel->findWithUnit($product['id']);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * PUT /api/products/{id}
     *
     * Supports multipart/form-data for image replacement.
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingProduct = $this->productModel->find($id);

        if (!$existingProduct) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Product not found'
            ], 404);

            return;
        }

      if (!empty($_POST)) {
    $data = $_POST;
} else {
    $data = $this->getRequestData();
}

        /*
         * Keep track of the old image.
         */
        $oldImage = $existingProduct['product_image'] ?? null;

        /*
         * New image
         */
        $uploadedImage = null;
        $uploadHelper = new UploadHelper();

        if (isset($_FILES['product_image'])) {
            try {
                $uploadedImage = $uploadHelper->upload(
                    $_FILES['product_image'],
                    'products'
                );

                $data['product_image'] = $uploadedImage['path'];
            } catch (Exception $e) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => $e->getMessage()
                ], 422);

                return;
            }
        }

        /*
         * Validate name if provided.
         */
        if (isset($data['name']) && trim($data['name']) === '') {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Product name cannot be empty'
            ], 422);

            return;
        }

        /*
         * Validate unit if provided.
         */
        if (isset($data['unit_id'])) {
            $unitId = (int) $data['unit_id'];

            if ($unitId <= 0 || !$this->unitModel->find($unitId)) {
                if ($uploadedImage) {
                    $uploadHelper->deleteFile($uploadedImage['path']);
                }

                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid unit'
                ], 422);

                return;
            }

            $data['unit_id'] = $unitId;
        }

        /*
         * Validate shelf life if provided.
         */
        if (isset($data['shelf_life'])) {
            if (
                !is_numeric($data['shelf_life']) ||
                (int) $data['shelf_life'] < 0
            ) {
                if ($uploadedImage) {
                    $uploadHelper->deleteFile($uploadedImage['path']);
                }

                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Shelf life must be a valid number of days'
                ], 422);

                return;
            }

            $data['shelf_life'] = (int) $data['shelf_life'];
        }

        /*
         * Validate price if provided.
         */
        if (isset($data['price'])) {
            if (
                !is_numeric($data['price']) ||
                (float) $data['price'] < 0
            ) {
                if ($uploadedImage) {
                    $uploadHelper->deleteFile($uploadedImage['path']);
                }

                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Price must be a valid positive number'
                ], 422);

                return;
            }

            $data['price'] = (float) $data['price'];
        }

        /*
         * Validate status if provided.
         */
        if (
            isset($data['status']) &&
            !in_array($data['status'], ['active', 'inactive'], true)
        ) {
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid product status'
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
         * Update product.
         */
        $updated = $this->productModel->update($id, $data);

        if (!$updated) {
            // Remove new image if database update failed.
            if ($uploadedImage) {
                $uploadHelper->deleteFile($uploadedImage['path']);
            }

            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to update product'
            ], 500);

            return;
        }

        /*
         * Delete old image only after successful update.
         */
        if ($uploadedImage && !empty($oldImage)) {
            $uploadHelper->deleteFile($oldImage);
        }

        /*
         * Return product with unit.
         */
        $product = $this->productModel->findWithUnit($id);

        $this->jsonResponse([
            'success' => true,
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * DELETE /api/products/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingProduct = $this->productModel->find($id);

        if (!$existingProduct) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Product not found'
            ], 404);

            return;
        }

        /*
         * Delete database record.
         */
        if (!$this->productModel->delete($id)) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to delete product'
            ], 500);

            return;
        }

        /*
         * Delete product image after database deletion.
         */
        if (!empty($existingProduct['product_image'])) {
            $uploadHelper = new UploadHelper();
            $uploadHelper->deleteFile($existingProduct['product_image']);
        }

        $this->jsonResponse([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}