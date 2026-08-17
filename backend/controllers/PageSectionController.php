<?php

class PageSectionController
{
    protected $page;
    protected $section;

    public function __construct()
    {
        $this->page = new Page();
        $this->section = new PageSection();
    }

    /**
     * GET /api/pages/{pageId}/sections
     */
    public function index($pageId)
    {
        $pageId = (int) $pageId;

        $page = $this->page->find($pageId);

        if (!$page) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
            ]);

            return;
        }

        $sections = $this->section->findByPageId($pageId);

        echo json_encode([
            'success' => true,
            'data' => $sections
        ]);
    }

    /**
     * GET /api/pages/{pageId}/sections/{sectionId}
     */
    public function show($pageId, $sectionId)
    {
        $pageId = (int) $pageId;
        $sectionId = (int) $sectionId;

        $section = $this->section->findByPageAndId(
            $pageId,
            $sectionId
        );

        if (!$section) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Section not found'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $section
        ]);
    }

    /**
     * POST /api/pages/{pageId}/sections
     */
    public function store($pageId)
    {
        $pageId = (int) $pageId;

        $page = $this->page->find($pageId);

        if (!$page) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
            ]);

            return;
        }

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON request'
            ]);

            return;
        }

        if (empty($data['type'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Section type is required'
            ]);

            return;
        }

        $data['page_id'] = $pageId;

        $data['position'] = isset($data['position'])
            ? (int) $data['position']
            : 0;

        $data['status'] = $data['status'] ?? 'active';

        if (!in_array(
            $data['status'],
            ['active', 'inactive'],
            true
        )) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid section status'
            ]);

            return;
        }

        $section = $this->section->createSection($data);

        if (!$section) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to create section'
            ]);

            return;
        }

        http_response_code(201);

        echo json_encode([
            'success' => true,
            'message' => 'Section created successfully',
            'data' => $section
        ]);
    }

    /**
     * PUT /api/pages/{pageId}/sections/{sectionId}
     */
    public function update($pageId, $sectionId)
    {
        $pageId = (int) $pageId;
        $sectionId = (int) $sectionId;

        $existingSection = $this->section->findByPageAndId(
            $pageId,
            $sectionId
        );

        if (!$existingSection) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Section not found'
            ]);

            return;
        }

        $data = json_decode(
            file_get_contents('php://input'),
            true
        );

        if (!is_array($data)) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid JSON request'
            ]);

            return;
        }

        // Never allow changing the section's page through this endpoint.
        unset($data['page_id']);

        if (isset($data['type']) && empty($data['type'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Section type cannot be empty'
            ]);

            return;
        }

        if (isset($data['position'])) {
            $data['position'] = (int) $data['position'];
        }

        if (isset($data['status'])) {
            if (!in_array(
                $data['status'],
                ['active', 'inactive'],
                true
            )) {
                http_response_code(422);

                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid section status'
                ]);

                return;
            }
        }

        $section = $this->section->updateSection(
            $sectionId,
            $data
        );

        if (!$section) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to update section'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Section updated successfully',
            'data' => $section
        ]);
    }

    /**
     * DELETE /api/pages/{pageId}/sections/{sectionId}
     */
    public function destroy($pageId, $sectionId)
    {
        $pageId = (int) $pageId;
        $sectionId = (int) $sectionId;

        $existingSection = $this->section->findByPageAndId(
            $pageId,
            $sectionId
        );

        if (!$existingSection) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Section not found'
            ]);

            return;
        }

        if ($this->section->delete($sectionId)) {
            echo json_encode([
                'success' => true,
                'message' => 'Section deleted successfully'
            ]);

            return;
        }

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete section'
        ]);
    }
    /**
 * PUT /api/pages/{pageId}/sections/reorder
 */
public function reorder($pageId)
{
    $pageId = (int) $pageId;

    // Make sure the page exists.
    $page = $this->page->find($pageId);

    if (!$page) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'Page not found'
        ]);

        return;
    }

    $data = json_decode(
        file_get_contents('php://input'),
        true
    );

    if (!is_array($data)) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Invalid JSON request'
        ]);

        return;
    }

    if (
        !isset($data['sections']) ||
        !is_array($data['sections']) ||
        empty($data['sections'])
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Sections array is required'
        ]);

        return;
    }

    $success = $this->section->reorder(
        $pageId,
        $data['sections']
    );

    if (!$success) {
        http_response_code(422);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to reorder sections'
        ]);

        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Sections reordered successfully',
        'data' => $this->section->findByPageId($pageId)
    ]);
}
}