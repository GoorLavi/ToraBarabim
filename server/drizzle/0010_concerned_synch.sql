CREATE TYPE "public"."rabbi_honorific" AS ENUM('rav', 'rabbanit');--> statement-breakpoint
ALTER TABLE "rabbis" ADD COLUMN "honorific" "rabbi_honorific" DEFAULT 'rav' NOT NULL;--> statement-breakpoint
-- Data step, hand-appended to the generated schema change above: a stored
-- name sometimes still carries its own honorific ("הרב שניאור אשכנזי"), and
-- this table has no reliable way to tell "הרבנית" from "הרב" apart other
-- than the text of the name itself. Every rabbi whose name starts with
-- "הרבנית" followed by whitespace becomes 'rabbanit' (the column default
-- above already covers everyone else as 'rav'); then every name has one
-- leading "הרבנית" or "הרב" plus whitespace stripped, so the stored name
-- becomes bare regardless of whether it carried a prefix before.
UPDATE "rabbis" SET "honorific" = 'rabbanit' WHERE "name" ~ '^הרבנית\s+';--> statement-breakpoint
UPDATE "rabbis" SET "name" = regexp_replace("name", '^(הרבנית|הרב)\s+', '') WHERE "name" ~ '^(הרבנית|הרב)\s+';