-- Fix trigger to only apply to backlog_tasks
DROP TRIGGER IF EXISTS update_news_articles_updated_at ON news_articles;

-- Recreate trigger only for backlog_tasks
DROP TRIGGER IF EXISTS update_backlog_updated_at ON backlog_tasks;
CREATE TRIGGER update_backlog_updated_at
  BEFORE UPDATE ON backlog_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_backlog_tasks_updated_at();

-- Add proper updated_at trigger for news_articles
CREATE OR REPLACE FUNCTION update_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_news_updated_at();