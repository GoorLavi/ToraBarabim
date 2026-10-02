CREATE TYPE "public"."visitor_message_type" AS ENUM('rabbi-request', 'volunteer');--> statement-breakpoint
CREATE TABLE "visitor_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "visitor_message_type" NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"handled_at" timestamp with time zone,
	"handling_note" text,
	CONSTRAINT "visitor_messages_phone_local_mobile" CHECK ("visitor_messages"."phone" ~ '^05[0-9]{8}$'),
	CONSTRAINT "visitor_messages_name_not_blank" CHECK (char_length(btrim("visitor_messages"."name")) > 0),
	CONSTRAINT "visitor_messages_message_not_blank" CHECK (char_length(btrim("visitor_messages"."message")) > 0),
	CONSTRAINT "visitor_messages_handling_note_not_blank" CHECK ("visitor_messages"."handling_note" IS NULL OR char_length(btrim("visitor_messages"."handling_note")) > 0)
);
