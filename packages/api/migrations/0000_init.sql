CREATE TABLE IF NOT EXISTS `categories` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `color` text NOT NULL DEFAULT '#6366f1',
  `icon` text NOT NULL DEFAULT '📋',
  `position` integer NOT NULL DEFAULT 0,
  `created_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `notes` text DEFAULT '',
  `category_id` text REFERENCES `categories`(`id`) ON DELETE SET NULL,
  `priority` text NOT NULL DEFAULT 'medium',
  `due_date` text,
  `start_date` text,
  `completed` integer NOT NULL DEFAULT 0,
  `completed_at` text,
  `position` real NOT NULL DEFAULT 0,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `tags` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL UNIQUE,
  `color` text NOT NULL DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS `task_tags` (
  `task_id` text NOT NULL REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  `tag_id` text NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS `idx_tasks_category` ON `tasks` (`category_id`);
CREATE INDEX IF NOT EXISTS `idx_tasks_completed` ON `tasks` (`completed`);
CREATE INDEX IF NOT EXISTS `idx_tasks_due_date` ON `tasks` (`due_date`);
CREATE INDEX IF NOT EXISTS `idx_tasks_position` ON `tasks` (`position`);
