ALTER TABLE "comments" ADD COLUMN "pipeline_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments" ADD CONSTRAINT "comments_pipeline_id_pipelines_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
