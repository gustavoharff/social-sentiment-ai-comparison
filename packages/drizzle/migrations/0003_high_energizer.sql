DO $$ BEGIN
 CREATE TYPE "tasks_type" AS ENUM('comments-collection', 'aws-analysis', 'google-analysis', 'azure-analysis');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "type" "tasks_type" NOT NULL;