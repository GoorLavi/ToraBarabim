ALTER TABLE "courses" DROP CONSTRAINT "courses_topic_shape";--> statement-breakpoint
ALTER TABLE "courses" DROP CONSTRAINT "courses_close_shape";--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_topic_shape" CHECK (("courses"."topic" IS NULL AND "courses"."topic_other" IS NULL)
       OR ("courses"."topic" IS NOT NULL AND "courses"."topic" <> 'other' AND "courses"."topic_other" IS NULL)
       OR ("courses"."topic" IS NOT NULL AND "courses"."topic" = 'other' AND "courses"."topic_other" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_close_shape" CHECK (("courses"."registration_closed_at" IS NULL AND "courses"."close_reason" IS NULL)
       OR ("courses"."registration_closed_at" IS NOT NULL AND "courses"."close_reason" IS NOT NULL AND "courses"."close_reason" IN ('closed', 'full')));