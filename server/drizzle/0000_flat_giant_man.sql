CREATE TYPE "public"."area" AS ENUM('north', 'haifa', 'sharon', 'center', 'telAviv', 'jerusalem', 'shfela', 'south');--> statement-breakpoint
CREATE TYPE "public"."exception_kind" AS ENUM('cancelled', 'modified');--> statement-breakpoint
CREATE TYPE "public"."lesson_audience" AS ENUM('men', 'women', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."lesson_topic" AS ENUM('gemara', 'halacha', 'parasha', 'mussar', 'chassidut', 'tanach', 'machshava', 'other');--> statement-breakpoint
CREATE TYPE "public"."recurrence_kind" AS ENUM('weekly', 'once');--> statement-breakpoint
CREATE TABLE "cities" (
	"code" integer PRIMARY KEY NOT NULL,
	"name_he" text NOT NULL,
	"name_en" text,
	"area" "area" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_exceptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"date" date NOT NULL,
	"kind" "exception_kind" NOT NULL,
	"reason" text,
	"start_time" text,
	"place_id" text,
	"substitute_rabbi_id" text,
	"note" text,
	CONSTRAINT "lesson_exceptions_lesson_date" UNIQUE("lesson_id","date"),
	CONSTRAINT "lesson_exceptions_shape" CHECK (("lesson_exceptions"."kind" = 'cancelled' AND "lesson_exceptions"."start_time" IS NULL AND "lesson_exceptions"."place_id" IS NULL AND "lesson_exceptions"."substitute_rabbi_id" IS NULL)
       OR ("lesson_exceptions"."kind" = 'modified' AND "lesson_exceptions"."reason" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"rabbi_id" text NOT NULL,
	"place_id" text NOT NULL,
	"topic" "lesson_topic" NOT NULL,
	"audience" "lesson_audience" NOT NULL,
	"recurrence_kind" "recurrence_kind" NOT NULL,
	"recurrence_weekdays" integer[],
	"recurrence_date" date,
	"start_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"notes" text,
	CONSTRAINT "lessons_recurrence_shape" CHECK (("lessons"."recurrence_kind" = 'weekly' AND "lessons"."recurrence_weekdays" IS NOT NULL AND "lessons"."recurrence_date" IS NULL)
       OR ("lessons"."recurrence_kind" = 'once' AND "lessons"."recurrence_date" IS NOT NULL AND "lessons"."recurrence_weekdays" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rabbis" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text,
	"photo_url" text,
	"bio" text
);
--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD CONSTRAINT "lesson_exceptions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD CONSTRAINT "lesson_exceptions_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD CONSTRAINT "lesson_exceptions_substitute_rabbi_id_rabbis_id_fk" FOREIGN KEY ("substitute_rabbi_id") REFERENCES "public"."rabbis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_rabbi_id_rabbis_id_fk" FOREIGN KEY ("rabbi_id") REFERENCES "public"."rabbis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_city_id_cities_code_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("code") ON DELETE no action ON UPDATE no action;