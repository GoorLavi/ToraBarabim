CREATE TABLE "course_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"storage_key" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_photos_course_id_position_unique" UNIQUE("course_id","position")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cycle" integer,
	"description" text NOT NULL,
	"rabbi_id" text,
	"teacher_name" text,
	"opening_date" date NOT NULL,
	"weeks" integer NOT NULL,
	"sessions" integer NOT NULL,
	"hours" integer,
	"place_id" text,
	"address_name" text,
	"address_street" text,
	"address_floor" text,
	"city_code" integer,
	"audience" "lesson_audience" NOT NULL,
	"topic" "lesson_topic",
	"topic_other" text,
	"joinable_after_opening" boolean DEFAULT false NOT NULL,
	"contact_phone" text NOT NULL,
	"price_shekels" integer,
	"cover_key" text NOT NULL,
	"registration_closed_at" timestamp with time zone,
	"close_reason" text,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_teacher_shape" CHECK (("courses"."rabbi_id" IS NOT NULL AND "courses"."teacher_name" IS NULL) OR ("courses"."rabbi_id" IS NULL AND "courses"."teacher_name" IS NOT NULL)),
	CONSTRAINT "courses_venue_shape" CHECK (("courses"."place_id" IS NOT NULL AND "courses"."address_name" IS NULL AND "courses"."address_street" IS NULL AND "courses"."address_floor" IS NULL)
       OR ("courses"."place_id" IS NULL AND "courses"."address_name" IS NOT NULL AND "courses"."address_street" IS NOT NULL)),
	CONSTRAINT "courses_venue_no_city_code_on_place" CHECK (("courses"."place_id" IS NOT NULL AND "courses"."city_code" IS NULL) OR ("courses"."place_id" IS NULL AND "courses"."city_code" IS NOT NULL)),
	CONSTRAINT "courses_topic_shape" CHECK (("courses"."topic" IS NULL AND "courses"."topic_other" IS NULL)
       OR ("courses"."topic" IS NOT NULL AND "courses"."topic" <> 'other' AND "courses"."topic_other" IS NULL)
       OR ("courses"."topic" = 'other' AND "courses"."topic_other" IS NOT NULL)),
	CONSTRAINT "courses_close_shape" CHECK (("courses"."registration_closed_at" IS NULL AND "courses"."close_reason" IS NULL)
       OR ("courses"."registration_closed_at" IS NOT NULL AND "courses"."close_reason" IN ('closed', 'full')))
);
--> statement-breakpoint
ALTER TABLE "course_photos" ADD CONSTRAINT "course_photos_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_rabbi_id_rabbis_id_fk" FOREIGN KEY ("rabbi_id") REFERENCES "public"."rabbis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_city_code_cities_code_fk" FOREIGN KEY ("city_code") REFERENCES "public"."cities"("code") ON DELETE no action ON UPDATE no action;