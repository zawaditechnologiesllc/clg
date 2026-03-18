import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const applicationTypeEnum = pgEnum("application_type", ["loan", "grant"]);
export const applicationCategoryEnum = pgEnum("application_category", [
  "personal",
  "business",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "under_review",
  "approved",
  "rejected",
]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  type: applicationTypeEnum("type").notNull(),
  category: applicationCategoryEnum("category").notNull(),
  amountRequested: numeric("amount_requested", {
    precision: 12,
    scale: 2,
  }).notNull(),
  preapprovedAmount: numeric("preapproved_amount", {
    precision: 12,
    scale: 2,
  }),
  status: applicationStatusEnum("status").notNull().default("pending"),
  paymentCode: text("payment_code"),
  fullName: text("full_name"),
  nationalId: text("national_id"),
  phoneNumber: text("phone_number"),
  employmentStatus: text("employment_status"),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }),
  purposeOfFunds: text("purpose_of_funds"),
  businessName: text("business_name"),
  registrationNumber: text("registration_number"),
  kraPin: text("kra_pin"),
  businessType: text("business_type"),
  annualRevenue: numeric("annual_revenue", { precision: 12, scale: 2 }),
  ownerDetails: text("owner_details"),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
