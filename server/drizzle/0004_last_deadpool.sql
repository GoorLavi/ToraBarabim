CREATE TYPE "public"."rabbi_prominence" AS ENUM('local', 'known', 'sought');--> statement-breakpoint
ALTER TABLE "rabbis" ADD COLUMN "prominence" "rabbi_prominence" DEFAULT 'local' NOT NULL;