import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sendConfirmationEmail, sendPasswordResetEmail } from "../lib/email.js";

const router = Router();

router.post("/register", async (req: AuthenticatedRequest, res) => {
  try {
    const {
      email, password, fullName, phoneNumber,
      bankCountry, bankName, bankAccountNumber, bankAccountName, swiftCode,
    } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({ error: "Email, password, and full name are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const confirmationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [user] = await db
      .insert(usersTable)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role: "user",
        phoneNumber: phoneNumber || null,
        emailConfirmed: false,
        confirmationToken,
        confirmationExpiry,
        bankCountry: bankCountry || null,
        bankName: bankName || null,
        bankAccountNumber: bankAccountNumber || null,
        bankAccountName: bankAccountName || null,
        swiftCode: swiftCode || null,
      })
      .returning();

    // Send confirmation email (non-blocking)
    sendConfirmationEmail(user.email, user.fullName, confirmationToken).catch(console.error);

    res.status(201).json({
      message: "Registration successful. Please check your email to confirm your account.",
      requiresConfirmation: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/confirm-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: "Confirmation token is required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.confirmationToken, token))
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "Invalid or expired confirmation link" });
      return;
    }
    if (user.confirmationExpiry && user.confirmationExpiry < new Date()) {
      res.status(400).json({ error: "Confirmation link has expired. Please register again." });
      return;
    }

    await db
      .update(usersTable)
      .set({ emailConfirmed: true, confirmationToken: null, confirmationExpiry: null })
      .where(eq(usersTable.id, user.id));

    res.json({ message: "Email confirmed successfully. You can now log in." });
  } catch (error) {
    console.error("Confirm email error:", error);
    res.status(500).json({ error: "Email confirmation failed" });
  }
});

router.post("/login", async (req: AuthenticatedRequest, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    if (!user.emailConfirmed) {
      res.status(403).json({
        error: "Please confirm your email before logging in.",
        requiresConfirmation: true,
      });
      return;
    }

    req.session!.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bankCountry: user.bankCountry,
        bankName: user.bankName,
        bankAccountNumber: user.bankAccountNumber,
        bankAccountName: user.bankAccountName,
        swiftCode: user.swiftCode,
        createdAt: user.createdAt,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req: AuthenticatedRequest, res) => {
  req.session!.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/me", async (req: AuthenticatedRequest, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    bankCountry: user.bankCountry,
    bankName: user.bankName,
    bankAccountNumber: user.bankAccountNumber,
    bankAccountName: user.bankAccountName,
    swiftCode: user.swiftCode,
    createdAt: user.createdAt,
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    // Always respond same way to prevent email enumeration
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db
        .update(usersTable)
        .set({ resetToken, resetExpiry })
        .where(eq(usersTable.id, user.id));

      sendPasswordResetEmail(user.email, user.fullName, resetToken).catch(console.error);
    }

    res.json({ message: "If that email is registered, you will receive a reset link shortly." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.resetToken, token))
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset link" });
      return;
    }
    if (user.resetExpiry && user.resetExpiry < new Date()) {
      res.status(400).json({ error: "Reset link has expired. Please request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db
      .update(usersTable)
      .set({ passwordHash, resetToken: null, resetExpiry: null })
      .where(eq(usersTable.id, user.id));

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

router.post("/resend-confirmation", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.emailConfirmed) {
      res.json({ message: "If that email exists and is unconfirmed, a new link has been sent." });
      return;
    }

    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const confirmationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(usersTable)
      .set({ confirmationToken, confirmationExpiry })
      .where(eq(usersTable.id, user.id));

    sendConfirmationEmail(user.email, user.fullName, confirmationToken).catch(console.error);

    res.json({ message: "If that email exists and is unconfirmed, a new link has been sent." });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    res.status(500).json({ error: "Failed to resend confirmation" });
  }
});

export default router;
