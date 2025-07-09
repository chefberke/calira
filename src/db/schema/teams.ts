import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  ownerId: integer("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
