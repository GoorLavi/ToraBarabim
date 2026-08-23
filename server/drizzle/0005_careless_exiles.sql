ALTER TABLE "lesson_exceptions" ADD COLUMN "place_name" text;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD COLUMN "place_street" text;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD COLUMN "place_floor" text;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD COLUMN "city_code" integer;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "place_name" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "place_street" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "place_floor" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "city_code" integer;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD CONSTRAINT "lesson_exceptions_city_code_cities_code_fk" FOREIGN KEY ("city_code") REFERENCES "public"."cities"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_city_code_cities_code_fk" FOREIGN KEY ("city_code") REFERENCES "public"."cities"("code") ON DELETE no action ON UPDATE no action;