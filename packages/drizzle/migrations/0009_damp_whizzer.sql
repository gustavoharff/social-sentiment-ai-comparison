ALTER TABLE "comments" DROP CONSTRAINT "comments_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN IF EXISTS "task_id";