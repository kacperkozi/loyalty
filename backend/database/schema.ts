import {
  text,
  json,
  timestamp,
  pgTable,
  varchar,
  decimal,
  serial,
} from "drizzle-orm/pg-core";

export const RequestStore = pgTable("request_store", {
  id: serial("id").primaryKey().notNull(),
  domain_name: varchar("key", { length: 128 }).unique(),
  status: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
