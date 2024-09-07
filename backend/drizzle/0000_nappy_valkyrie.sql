CREATE TABLE IF NOT EXISTS "request_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(128),
	"value" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "request_store_key_unique" UNIQUE("key")
);
