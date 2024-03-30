DO $$ BEGIN
 CREATE TYPE "tasks_status" AS ENUM('pending', 'running', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "tasks_status" DEFAULT 'pending' NOT NULL,
	"started_at" timestamp,
	"finished_at" timestamp,
	"pipeline_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pipelines" DROP COLUMN IF EXISTS "status";--> statement-breakpoint
ALTER TABLE "pipelines" DROP COLUMN IF EXISTS "started_at";--> statement-breakpoint
ALTER TABLE "pipelines" DROP COLUMN IF EXISTS "finished_at";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tasks" ADD CONSTRAINT "tasks_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
