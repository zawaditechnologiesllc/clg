import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  boolean,
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
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "completed",
  "failed",
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
  // Admin sets this on approval
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  status: applicationStatusEnum("status").notNull().default("pending"),
  // Release tracking
  releaseDate: timestamp("release_date"),
  isReleased: boolean("is_released").notNull().default(false),
  availableBalance: numeric("available_balance", { precision: 12, scale: 2 }).default("0"),
  // Payment
  paymentCode: text("payment_code"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  mpesaCheckoutRequestId: text("mpesa_checkout_request_id"),
  processingFeeKes: numeric("processing_fee_kes", { precision: 10, scale: 2 }),
  // Applicant Details
  fullName: text("full_name"),
  nationalId: text("national_id"),
  phoneNumber: text("phone_number"),
  employmentStatus: text("employment_status"),
  monthlyIncome: numeric("monthly_income", { precision: 12, scale: 2 }),
  purposeOfFunds: text("purpose_of_funds"),
  // Business Details
  businessName: text("business_name"),
  registrationNumber: text("registration_number"),
  kraPin: text("kra_pin"),
  businessType: text("business_type"),
  annualRevenue: numeric("annual_revenue", { precision: 12, scale: 2 }),
  ownerDetails: text("owner_details"),
  // Documents (JSON array of {type, path, name})
  documentPaths: text("document_paths"),
  // Payout Method
  payoutBankCountry: text("payout_bank_country"),
  payoutBankName: text("payout_bank_name"),
  payoutBankAccountNumber: text("payout_bank_account_number"),
  payoutBankAccountName: text("payout_bank_account_name"),
  payoutSwiftCode: text("payout_swift_code"),
  // Admin
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
