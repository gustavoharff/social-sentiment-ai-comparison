ALTER TABLE "pipelines" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pipelines" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;