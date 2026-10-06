ALTER TYPE "public"."visitor_message_type" ADD VALUE 'report-mistake';--> statement-breakpoint
ALTER TABLE "visitor_messages" ADD COLUMN "subject_kind" text;--> statement-breakpoint
ALTER TABLE "visitor_messages" ADD COLUMN "subject_id" text;--> statement-breakpoint
ALTER TABLE "visitor_messages" ADD COLUMN "subject_date" date;--> statement-breakpoint
ALTER TABLE "visitor_messages" ADD CONSTRAINT "visitor_messages_subject_by_type" CHECK (("visitor_messages"."type"::text = 'report-mistake' AND "visitor_messages"."subject_kind" IS NOT NULL AND "visitor_messages"."subject_id" IS NOT NULL)
       OR ("visitor_messages"."type"::text <> 'report-mistake' AND "visitor_messages"."subject_kind" IS NULL AND "visitor_messages"."subject_id" IS NULL AND "visitor_messages"."subject_date" IS NULL));--> statement-breakpoint
ALTER TABLE "visitor_messages" ADD CONSTRAINT "visitor_messages_subject_shape" CHECK (("visitor_messages"."subject_kind" IS NULL AND "visitor_messages"."subject_id" IS NULL AND "visitor_messages"."subject_date" IS NULL)
       OR ("visitor_messages"."subject_kind" IS NOT NULL AND "visitor_messages"."subject_kind" IN ('lesson', 'place') AND "visitor_messages"."subject_id" IS NOT NULL
           AND (("visitor_messages"."subject_kind" = 'lesson' AND "visitor_messages"."subject_date" IS NOT NULL) OR ("visitor_messages"."subject_kind" = 'place' AND "visitor_messages"."subject_date" IS NULL))));