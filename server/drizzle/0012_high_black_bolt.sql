ALTER TYPE "public"."admin_role" ADD VALUE 'place';--> statement-breakpoint
CREATE TABLE "places" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"floor" text,
	"city_code" integer NOT NULL,
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" DROP CONSTRAINT "admin_users_role_rabbi_id_shape";--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "place_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "place_street" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "place_id" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "place_id" text;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_city_code_cities_code_fk" FOREIGN KEY ("city_code") REFERENCES "public"."cities"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_place_id_unique" UNIQUE("place_id");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_shape" CHECK (("admin_users"."role"::text = 'rabbi' AND "admin_users"."rabbi_id" IS NOT NULL AND "admin_users"."place_id" IS NULL)
       OR ("admin_users"."role"::text = 'place' AND "admin_users"."place_id" IS NOT NULL AND "admin_users"."rabbi_id" IS NULL)
       OR ("admin_users"."role"::text = 'admin' AND "admin_users"."rabbi_id" IS NULL AND "admin_users"."place_id" IS NULL));--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_venue_shape" CHECK (("lessons"."place_id" IS NOT NULL AND "lessons"."place_name" IS NULL AND "lessons"."place_street" IS NULL AND "lessons"."place_floor" IS NULL)
       OR ("lessons"."place_id" IS NULL AND "lessons"."place_name" IS NOT NULL AND "lessons"."place_street" IS NOT NULL));