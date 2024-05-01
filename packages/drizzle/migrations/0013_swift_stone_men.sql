DO $$ BEGIN
 CREATE TYPE "sentiments_providers" AS ENUM('aws', 'google', 'azure');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "comments_sentiment" ADD VALUE 'mixed';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comments_sentiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "sentiments_providers" NOT NULL,
	"sentiment" "comments_sentiment" NOT NULL,
	"comment_id" uuid NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "comments_sentiments" ADD CONSTRAINT "comments_sentiments_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
