<?php

class UnitController
{
    protected $unit;

    public function __construct()
    {
        $this->unit = new Unit();
    }

    /**
     * GET /api/units
     */
    public function index()
    {
        $units = $this->unit->all();

        echo json_encode([
            'success' => true,
            'data' => $units
        ]);
    }

    /**
     * GET /api/units/{id}
     */
    public function show($id)
    {
        $id = (int) $id;

        $unit = $this->unit->find($id);

        if (!$unit) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Unit not found'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $unit
        ]);
    }

    /**
     * POST /api/units
     */
    public function store()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON request'
            ]);

            return;
        }

        if (empty($data['code'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Code is required'
            ]);

            return;
        }

        if (empty($data['name'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Name is required'
            ]);

            return;
        }

        if (empty($data['symbol'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Symbol is required'
            ]);

            return;
        }

        $existingUnit = $this->unit->findByCode($data['code']);

        if ($existingUnit) {
            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' => 'A unit with this code already exists'
            ]);

            return;
        }

        $unit = $this->unit->create($data);

        if (!$unit) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to create unit'
            ]);

            return;
        }

        http_response_code(201);

        echo json_encode([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit
        ]);
    }

    /**
     * PUT /api/units/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingUnit = $this->unit->find($id);

        if (!$existingUnit) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Unit not found'
            ]);

            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON request'
            ]);

            return;
        }

        if (isset($data['code'])) {
            if (empty($data['code'])) {
                http_response_code(422);

                echo json_encode([
                    'success' => false,
                    'message' => 'Code cannot be empty'
                ]);

                return;
            }

            $unitWithCode = $this->unit->findByCode($data['code']);

            if ($unitWithCode && (int) $unitWithCode['id'] !== $id) {
                http_response_code(409);

                echo json_encode([
                    'success' => false,
                    'message' => 'A unit with this code already exists'
                ]);

                return;
            }
        }

        if (isset($data['name']) && empty($data['name'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Name cannot be empty'
            ]);

            return;
        }

        if (isset($data['symbol']) && empty($data['symbol'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Symbol cannot be empty'
            ]);

            return;
        }

        $unit = $this->unit->update($id, $data);

        if (!$unit) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to update unit'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit
        ]);
    }

    /**
     * DELETE /api/units/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingUnit = $this->unit->find($id);

        if (!$existingUnit) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Unit not found'
            ]);

            return;
        }

        if ($this->unit->delete($id)) {
            echo json_encode([
                'success' => true,
                'message' => 'Unit deleted successfully'
            ]);

            return;
        }

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete unit'
        ]);
    }
}