-- Add parent_id column to page_registry
ALTER TABLE page_registry
ADD COLUMN parent_id INTEGER;

-- Update existing pages with new hierarchical structure
-- Startseite
UPDATE page_registry SET page_id = 1, parent_id = NULL WHERE page_slug = 'index';

-- First level navigation (Parent ID: 1)
UPDATE page_registry SET page_id = 2, parent_id = 1 WHERE page_slug = 'your-solution';
UPDATE page_registry SET page_id = 3, parent_id = 1 WHERE page_slug = 'products';
UPDATE page_registry SET page_id = 4, parent_id = 1 WHERE page_slug = 'downloads';
UPDATE page_registry SET page_id = 5, parent_id = 1 WHERE page_slug = 'events';
UPDATE page_registry SET page_id = 6, parent_id = 1 WHERE page_slug = 'news';
UPDATE page_registry SET page_id = 7, parent_id = 1 WHERE page_slug = 'inside-lab';
UPDATE page_registry SET page_id = 8, parent_id = 1 WHERE page_slug = 'contact';

-- Under "Your Solution" (Parent ID: 2)
UPDATE page_registry SET page_id = 9, parent_id = 2 WHERE page_slug = 'photography';
UPDATE page_registry SET page_id = 10, parent_id = 2 WHERE page_slug = 'scanners-archiving';
UPDATE page_registry SET page_id = 11, parent_id = 2 WHERE page_slug = 'medical-endoscopy';
UPDATE page_registry SET page_id = 12, parent_id = 2 WHERE page_slug = 'web-camera';
UPDATE page_registry SET page_id = 13, parent_id = 2 WHERE page_slug = 'machine-vision';