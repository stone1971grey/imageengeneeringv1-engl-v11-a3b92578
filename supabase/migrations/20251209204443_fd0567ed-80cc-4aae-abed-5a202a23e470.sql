-- Add position column to media_folders for custom sorting
ALTER TABLE media_folders ADD COLUMN IF NOT EXISTS position integer DEFAULT 999;

-- Set positions for root folders according to navigation hierarchy:
-- 1. index (Homepage)
-- 2. your-solution
-- 3. products
-- 4. test-lab
-- 5. training-events
-- 6. info-hub
-- 7. company
-- 8. Media (misc)
-- 9. News
-- 10. styleguide

UPDATE media_folders SET position = 1 WHERE storage_path = 'index' AND parent_id IS NULL;
UPDATE media_folders SET position = 7 WHERE storage_path = 'company' AND parent_id IS NULL;
UPDATE media_folders SET position = 8 WHERE storage_path = 'media' AND parent_id IS NULL;
UPDATE media_folders SET position = 9 WHERE storage_path = 'News' AND parent_id IS NULL;
UPDATE media_folders SET position = 10 WHERE storage_path = 'styleguide' AND parent_id IS NULL;

-- Set default position for child folders (will sort by name within parent)
UPDATE media_folders SET position = 0 WHERE parent_id IS NOT NULL;