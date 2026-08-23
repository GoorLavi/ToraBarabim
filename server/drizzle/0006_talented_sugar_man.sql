-- Hand-added: copy each lesson's and each exception's venue out of `places`
-- and into the new columns before the table is dropped below, so no venue
-- data is lost in the cutover. `places` never had a floor, so `place_floor`
-- stays NULL for migrated rows; the admin can fill it in afterwards.
UPDATE "lessons" AS l
SET "place_name" = p."name",
    "place_street" = p."address",
    "city_code" = p."city_id"
FROM "places" AS p
WHERE p."id" = l."place_id";--> statement-breakpoint

UPDATE "lesson_exceptions" AS e
SET "place_name" = p."name",
    "place_street" = p."address",
    "city_code" = p."city_id"
FROM "places" AS p
WHERE e."place_id" IS NOT NULL AND p."id" = e."place_id";--> statement-breakpoint

-- Hand-reordered: drop the two foreign keys into `places` explicitly,
-- before dropping `places` itself, rather than relying on `DROP TABLE
-- ... CASCADE` to remove them as a side effect. `CASCADE` already drops
-- them, so the drizzle-kit-generated `DROP CONSTRAINT` statements that
-- originally followed the `DROP TABLE` failed with "constraint ... does
-- not exist"; dropping the constraints first makes the plain `DROP TABLE`
-- that follows unsurprising, instead of leaning on an implicit cascade.
ALTER TABLE "lesson_exceptions" DROP CONSTRAINT "lesson_exceptions_place_id_places_id_fk";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_place_id_places_id_fk";--> statement-breakpoint
ALTER TABLE "places" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "places";--> statement-breakpoint
ALTER TABLE "lesson_exceptions" DROP CONSTRAINT "lesson_exceptions_shape";--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "place_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "place_street" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "city_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_exceptions" DROP COLUMN "place_id";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "place_id";--> statement-breakpoint
ALTER TABLE "lesson_exceptions" ADD CONSTRAINT "lesson_exceptions_shape" CHECK (("lesson_exceptions"."kind" = 'cancelled' AND "lesson_exceptions"."start_time" IS NULL AND "lesson_exceptions"."place_name" IS NULL AND "lesson_exceptions"."place_street" IS NULL AND "lesson_exceptions"."place_floor" IS NULL AND "lesson_exceptions"."city_code" IS NULL AND "lesson_exceptions"."substitute_rabbi_id" IS NULL)
       OR ("lesson_exceptions"."kind" = 'modified' AND "lesson_exceptions"."reason" IS NULL AND ("lesson_exceptions"."place_name" IS NULL) = ("lesson_exceptions"."place_street" IS NULL) AND ("lesson_exceptions"."place_name" IS NULL) = ("lesson_exceptions"."city_code" IS NULL) AND ("lesson_exceptions"."place_floor" IS NULL OR "lesson_exceptions"."place_name" IS NOT NULL)));
