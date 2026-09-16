CREATE TYPE "public"."lesson_import_link_decision" AS ENUM('linked', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."lesson_import_link_origin" AS ENUM('auto', 'owner');--> statement-breakpoint
CREATE TYPE "public"."lesson_import_rule_kind" AS ENUM('city_alias', 'time_kind', 'audience_alias', 'topic_alias');--> statement-breakpoint
CREATE TYPE "public"."lesson_provenance" AS ENUM('manual', 'imported', 'imported_edited');--> statement-breakpoint
CREATE TABLE "lesson_import_dismissed_keys" (
	"import_key" text PRIMARY KEY NOT NULL,
	"dismissed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_import_rabbi_links" (
	"name_key" text NOT NULL,
	"source" text NOT NULL,
	"rabbi_id" text,
	"decision" "lesson_import_link_decision" NOT NULL,
	"origin" "lesson_import_link_origin" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_import_rabbi_links_name_key_source_pk" PRIMARY KEY("name_key","source"),
	CONSTRAINT "lesson_import_rabbi_links_decision_shape" CHECK (("lesson_import_rabbi_links"."decision" = 'linked' AND "lesson_import_rabbi_links"."rabbi_id" IS NOT NULL) OR ("lesson_import_rabbi_links"."decision" = 'ignored' AND "lesson_import_rabbi_links"."rabbi_id" IS NULL)),
	CONSTRAINT "lesson_import_rabbi_links_auto_only_linked" CHECK ("lesson_import_rabbi_links"."origin" = 'owner' OR "lesson_import_rabbi_links"."decision" = 'linked')
);
--> statement-breakpoint
CREATE TABLE "lesson_import_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" "lesson_import_rule_kind" NOT NULL,
	"match_text" text NOT NULL,
	"value" jsonb NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_import_rules_kind_match_text" UNIQUE("kind","match_text")
);
--> statement-breakpoint
CREATE TABLE "lesson_import_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL,
	"week" text NOT NULL,
	"file_sha256" text NOT NULL,
	"counts" jsonb NOT NULL,
	"deleted" jsonb NOT NULL,
	"withheld" jsonb NOT NULL,
	"new_links" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "provenance" "lesson_provenance" DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "import_key" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "import_sources" text[];--> statement-breakpoint
ALTER TABLE "lesson_import_rabbi_links" ADD CONSTRAINT "lesson_import_rabbi_links_rabbi_id_rabbis_id_fk" FOREIGN KEY ("rabbi_id") REFERENCES "public"."rabbis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_import_key_unique" ON "lessons" USING btree ("import_key") WHERE "lessons"."import_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_provenance_shape" CHECK (("lessons"."provenance" = 'manual' AND "lessons"."import_key" IS NULL AND "lessons"."import_sources" IS NULL)
       OR ("lessons"."provenance" IN ('imported', 'imported_edited') AND "lessons"."import_key" IS NOT NULL));