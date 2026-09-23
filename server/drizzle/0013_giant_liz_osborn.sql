CREATE TYPE "public"."dedication_honorific" AS ENUM('zl', 'ah', 'hyd');--> statement-breakpoint
CREATE TYPE "public"."dedication_type" AS ENUM('memorial', 'healing', 'success');--> statement-breakpoint
CREATE TYPE "public"."honored_gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "dedications" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "dedication_type" NOT NULL,
	"honored_name" text NOT NULL,
	"honorific" "dedication_honorific",
	"honored_gender" "honored_gender",
	"parent_name" text,
	"donor_family_name" text,
	"closing_line_enabled" boolean DEFAULT false NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"taken_down_at" timestamp with time zone,
	"taken_down_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dedications_window" CHECK ("dedications"."ends_on" >= "dedications"."starts_on"),
	CONSTRAINT "dedications_takedown_reason" CHECK (("dedications"."taken_down_at" IS NULL) = ("dedications"."taken_down_reason" IS NULL)),
	CONSTRAINT "dedications_honorific_memorial_only" CHECK ("dedications"."honorific" IS NULL OR "dedications"."type" = 'memorial')
);
