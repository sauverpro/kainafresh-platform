<?php

class Page extends Model
{
    protected $table = 'pages';

    protected $primaryKey = 'id';

    protected $fillable = [
        'title',
        'slug',
        'status',
        'seo_title',
        'seo_description',
        'seo_image_id'
    ];

    public function findBySlug($slug)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE `slug` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);

        $stmt->bind_param("s", $slug);

        $stmt->execute();

        $result = $stmt->get_result();

        return $this->fetchOne($result);
    }

    /**
     * Get a page together with its sections.
     */
    public function findWithSections($id)
    {
        $page = $this->find($id);

        if (!$page) {
            return null;
        }

        $sectionModel = new PageSection();

        $page['sections'] = $sectionModel->findByPageId($id);

        return $page;
    }

    /**
     * Get a page by slug together with its sections.
     */
    public function findBySlugWithSections($slug)
    {
        $page = $this->findBySlug($slug);

        if (!$page) {
            return null;
        }

        $sectionModel = new PageSection();

        $page['sections'] = $sectionModel->findByPageId($page['id']);

        return $page;
    }
}