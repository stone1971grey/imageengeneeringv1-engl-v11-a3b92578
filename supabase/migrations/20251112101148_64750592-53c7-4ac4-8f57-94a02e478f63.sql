-- Add automotive page under Your Solution (parent_id = 2)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (14, 'automotive', 'Automotive', 2, 'your-solution');

-- Add test-charts category page under Products (parent_id = 3)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (15, 'test-charts', 'Test Charts', 3, 'products');

-- Add illumination-devices category page under Products (parent_id = 3)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (16, 'illumination-devices', 'Illumination Devices', 3, 'products');

-- Add le7 product page under test-charts (parent_id = 15)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (17, 'le7', 'LE7 Test Chart', 15, 'test-charts');

-- Add arcturus product page under illumination-devices (parent_id = 16)
INSERT INTO page_registry (page_id, page_slug, page_title, parent_id, parent_slug)
VALUES (18, 'arcturus', 'Arcturus', 16, 'illumination-devices');