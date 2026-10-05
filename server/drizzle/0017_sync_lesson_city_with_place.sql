-- `lessons.city_code` is denormalized from `places.city_code` for a
-- place-backed lesson (see `lessonVenueColumns`), so a place moving city must
-- carry its lessons with it. Done here rather than in each service that edits
-- a place, so a future writer of `places.city_code` cannot forget it.
-- Not expressible in the Drizzle schema, so this file is hand-written
-- (`drizzle-kit generate --custom`).
--
-- Repairs any lesson a city edit already left behind. The place's city wins:
-- it is the value the admin or the place itself last chose.
UPDATE "lessons" SET "city_code" = "places"."city_code"
FROM "places"
WHERE "lessons"."place_id" = "places"."id" AND "lessons"."city_code" <> "places"."city_code";--> statement-breakpoint
CREATE FUNCTION "sync_lessons_city_code_with_place"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE "lessons" SET "city_code" = NEW."city_code" WHERE "place_id" = NEW."id";
  RETURN NULL;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "places_city_code_sync_lessons"
AFTER UPDATE OF "city_code" ON "places"
FOR EACH ROW
WHEN (OLD."city_code" IS DISTINCT FROM NEW."city_code")
EXECUTE FUNCTION "sync_lessons_city_code_with_place"();
