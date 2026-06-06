import { pgTable, serial, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  phoneNumber: text("phone_number"),
  emailConfirmed: boolean("email_confirmed").notNull().default(false),
  confirmationToken: text("confirmation_token"),
  confirmationExpiry: timestamp("confirmation_expiry"),
  resetToken: text("reset_token"),
  resetExpiry: timestamp("reset_expiry"),
  // Payout bank details (set during signup)
  bankCountry: text("bank_country"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountName: text("bank_account_name"),
  swiftCode: text("swift_code"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
