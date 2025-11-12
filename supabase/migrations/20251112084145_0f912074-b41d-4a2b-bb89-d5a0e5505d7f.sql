-- Add deleted flag to segment_registry to track deleted segments
-- This ensures IDs are never reused even after deletion
ALTER TABLE segment_registry 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_segment_registry_deleted 
ON segment_registry(deleted);

-- Comment explaining the purpose
COMMENT ON COLUMN segment_registry.deleted IS 'Marks segments as deleted without removing them from registry. Ensures segment IDs are never reused.';
