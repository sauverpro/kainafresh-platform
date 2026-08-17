<?php

class PageSection extends Model
{
    protected $table = 'page_sections';

    protected $primaryKey = 'id';

    protected $fillable = [
        'page_id',
        'type',
        'title',
        'content',
        'settings',
        'position',
        'status'
    ];

    /**
     * Get all sections belonging to a page.
     */
    public function findByPageId($pageId)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE `page_id` = ?
                ORDER BY `position` ASC, `id` ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("i", $pageId);
        $stmt->execute();

        $result = $stmt->get_result();

        return $this->decodeJsonFields($this->fetchAll($result));
    }

    /**
     * Find a section belonging to a specific page.
     */
    public function findByPageAndId($pageId, $sectionId)
    {
        $sql = "SELECT *
                FROM `{$this->table}`
                WHERE `page_id` = ?
                AND `id` = ?
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("ii", $pageId, $sectionId);
        $stmt->execute();

        $result = $stmt->get_result();

        $section = $this->fetchOne($result);

        if (!$section) {
            return null;
        }

        return $this->decodeJsonSection($section);
    }

    /**
     * Convert JSON database fields into PHP arrays.
     */
    protected function decodeJsonFields($sections)
    {
        foreach ($sections as &$section) {
            $section = $this->decodeJsonSection($section);
        }

        return $sections;
    }

    protected function decodeJsonSection($section)
    {
        if (!empty($section['content'])) {
            $decoded = json_decode($section['content'], true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $section['content'] = $decoded;
            }
        } else {
            $section['content'] = null;
        }

        if (!empty($section['settings'])) {
            $decoded = json_decode($section['settings'], true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $section['settings'] = $decoded;
            }
        } else {
            $section['settings'] = null;
        }

        return $section;
    }

    /**
     * Create a section.
     *
     * JSON fields are encoded before using the base Model::create().
     */
    public function createSection($data)
    {
        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        if (isset($data['settings']) && is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }

        $section = $this->create($data);

        if (!$section) {
            return false;
        }

        return $this->findByPageAndId(
            $data['page_id'],
            $section['id']
        );
    }

    /**
     * Update a section.
     */
    public function updateSection($sectionId, $data)
    {
        if (isset($data['content']) && is_array($data['content'])) {
            $data['content'] = json_encode($data['content']);
        }

        if (isset($data['settings']) && is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }

        $section = $this->update($sectionId, $data);

        if (!$section) {
            return false;
        }

        return $this->find($sectionId);
    }

    /**
 * Reorder sections belonging to a page.
 *
 * @param int   $pageId
 * @param array $sections
 * @return bool
 */
public function reorder($pageId, $sections)
{
    if (empty($sections)) {
        return false;
    }

    $connection = $this->db->getConnection();

    // Start transaction so either everything succeeds or nothing changes.
    $connection->begin_transaction();

    try {

        /*
         * First verify that every section belongs to this page.
         */
        $checkSql = "
            SELECT id
            FROM `{$this->table}`
            WHERE page_id = ?
        ";

        $checkStmt = $connection->prepare($checkSql);
        $checkStmt->bind_param("i", $pageId);
        $checkStmt->execute();

        $result = $checkStmt->get_result();

        $existingIds = [];

        while ($row = $result->fetch_assoc()) {
            $existingIds[] = (int) $row['id'];
        }

        /*
         * Validate submitted section IDs.
         */
        $submittedIds = [];

        foreach ($sections as $section) {

            if (!isset($section['id']) || !isset($section['position'])) {
                throw new Exception('Each section must have id and position');
            }

            $sectionId = (int) $section['id'];
            $position = (int) $section['position'];

            if (!in_array($sectionId, $existingIds, true)) {
                throw new Exception(
                    "Section {$sectionId} does not belong to page {$pageId}"
                );
            }

            if ($position < 0) {
                throw new Exception(
                    "Section {$sectionId} has an invalid position"
                );
            }

            if (in_array($sectionId, $submittedIds, true)) {
                throw new Exception(
                    "Section {$sectionId} was submitted more than once"
                );
            }

            $submittedIds[] = $sectionId;
        }

        /*
         * Update each section's position.
         */
        $updateSql = "
            UPDATE `{$this->table}`
            SET `position` = ?
            WHERE `id` = ?
            AND `page_id` = ?
        ";

        $updateStmt = $connection->prepare($updateSql);

        foreach ($sections as $section) {

            $sectionId = (int) $section['id'];
            $position = (int) $section['position'];

            $updateStmt->bind_param(
                "iii",
                $position,
                $sectionId,
                $pageId
            );

            if (!$updateStmt->execute()) {
                throw new Exception(
                    "Failed to update section {$sectionId}"
                );
            }
        }

        $connection->commit();

        return true;

    } catch (Exception $e) {

        $connection->rollback();

        return false;
    }
}
}