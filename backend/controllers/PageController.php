<?php

class PageController
{
    protected $page;

    public function __construct()
    {
        $this->page = new Page();
    }

    /**
     * GET /api/pages
     */
    public function index()
    {
        $pages = $this->page->all();

        echo json_encode([
            'success' => true,
            'data' => $pages
        ]);
    }

    /**
     * GET /api/pages/{id}
     */
    public function show($id)
    {
       $page = $this->page->findWithSections((int) $id);

        if (!$page) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $page
        ]);
    }

    /**
     * GET /api/pages/slug/{slug}
     */
    public function showBySlug($slug)
    {
        $page = $this->page->findBySlugWithSections($slug);

        if (!$page) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'data' => $page
        ]);
    }

    /**
     * POST /api/pages
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

        if (empty($data['title'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Title is required'
            ]);

            return;
        }

        if (empty($data['slug'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Slug is required'
            ]);

            return;
        }

        $existingPage = $this->page->findBySlug($data['slug']);

        if ($existingPage) {
            http_response_code(409);

            echo json_encode([
                'success' => false,
                'message' => 'A page with this slug already exists'
            ]);

            return;
        }

        $data['status'] = $data['status'] ?? 'draft';

        if (!in_array($data['status'], ['draft', 'published'], true)) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid page status'
            ]);

            return;
        }

        $page = $this->page->create($data);

        if (!$page) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to create page'
            ]);

            return;
        }

        http_response_code(201);

        echo json_encode([
            'success' => true,
            'message' => 'Page created successfully',
            'data' => $page
        ]);
    }

    /**
     * PUT /api/pages/{id}
     */
    public function update($id)
    {
        $id = (int) $id;

        $existingPage = $this->page->find($id);

        if (!$existingPage) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
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

        if (isset($data['title']) && empty($data['title'])) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Title cannot be empty'
            ]);

            return;
        }

        if (isset($data['slug'])) {
            if (empty($data['slug'])) {
                http_response_code(422);

                echo json_encode([
                    'success' => false,
                    'message' => 'Slug cannot be empty'
                ]);

                return;
            }

            $pageWithSlug = $this->page->findBySlug($data['slug']);

            if ($pageWithSlug && (int) $pageWithSlug['id'] !== $id) {
                http_response_code(409);

                echo json_encode([
                    'success' => false,
                    'message' => 'A page with this slug already exists'
                ]);

                return;
            }
        }

        if (
            isset($data['status']) &&
            !in_array($data['status'], ['draft', 'published'], true)
        ) {
            http_response_code(422);

            echo json_encode([
                'success' => false,
                'message' => 'Invalid page status'
            ]);

            return;
        }

        $page = $this->page->update($id, $data);

        if (!$page) {
            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'Failed to update page'
            ]);

            return;
        }

        echo json_encode([
            'success' => true,
            'message' => 'Page updated successfully',
            'data' => $page
        ]);
    }

    /**
     * DELETE /api/pages/{id}
     */
    public function destroy($id)
    {
        $id = (int) $id;

        $existingPage = $this->page->find($id);

        if (!$existingPage) {
            http_response_code(404);

            echo json_encode([
                'success' => false,
                'message' => 'Page not found'
            ]);

            return;
        }

        if ($this->page->delete($id)) {
            echo json_encode([
                'success' => true,
                'message' => 'Page deleted successfully'
            ]);

            return;
        }

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete page'
        ]);
    }
}