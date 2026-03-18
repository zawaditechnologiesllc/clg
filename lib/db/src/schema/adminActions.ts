import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { applicationsTable } from "./applications";

export const adminActionTypeEnum = pgEnum("admin_action_type", [
  "approved",
  "rejected",
  "reviewed",
]);

export const adminActionsTable = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => applicationsTable.id),
  adminId: integer("admin_id")
    .notNull()
    .references(() => usersTable.id),
  action: adminActionTypeEnum("action").notNull(),
  reason: text("reason").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAdminActionSchema = createInsertSchema(adminActionsTable).omit({
  id: true,
  timestamp: true,
});

export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActionsTable.$inferSelect;
