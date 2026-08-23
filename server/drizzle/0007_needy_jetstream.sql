CREATE TYPE "public"."admin_role" AS ENUM('admin', 'rabbi');--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "role" "admin_role" DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_users" ADD COLUMN "rabbi_id" text;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_rabbi_id_rabbis_id_fk" FOREIGN KEY ("rabbi_id") REFERENCES "public"."rabbis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_rabbi_id_unique" UNIQUE("rabbi_id");--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_role_rabbi_id_shape" CHECK (("admin_users"."role" = 'rabbi' AND "admin_users"."rabbi_id" IS NOT NULL) OR ("admin_users"."role" = 'admin' AND "admin_users"."rabbi_id" IS NULL));