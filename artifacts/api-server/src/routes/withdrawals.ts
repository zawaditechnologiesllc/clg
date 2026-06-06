import { Router } from "express";
import { db } from "@workspace/db";
import { withdrawalsTable, applicationsTable, notificationsTable } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

// Get user's withdrawal requests
router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const withdrawals = await db
      .select()
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.userId, req.userId!))
      .orderBy(desc(withdrawalsTable.createdAt));

    res.json(withdrawals.map((w: typeof withdrawals[0]) => ({ ...w, amount: parseFloat(w.amount) })));
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// Request a withdrawal
router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      applicationId, amount,
      bankCountry, bankName, bankAccountNumber, bankAccountName, swiftCode,
    } = req.body;

    if (!applicationId || !amount || !bankCountry || !bankName || !bankAccountNumber || !bankAccountName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      res.status(400).json({ error: "Invalid withdrawal amount" });
      return;
    }

    // Verify the application belongs to user and has sufficient released balance
    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(and(eq(applicationsTable.id, parseInt(applicationId)), eq(applicationsTable.userId, req.userId!)))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (!app.isReleased) {
      res.status(400).json({ error: "Funds are not yet released for this application" });
      return;
    }

    const available = parseFloat(app.availableBalance || "0");
    if (withdrawAmount > available) {
      res.status(400).json({ error: `Insufficient available balance. Available: $${available.toLocaleString()}` });
      return;
    }

    // Temporarily deduct from balance (restored if rejected)
    await db
      .update(applicationsTable)
      .set({
        availableBalance: (available - withdrawAmount).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(applicationsTable.id, app.id));

    const [withdrawal] = await db
      .insert(withdrawalsTable)
      .values({
        userId: req.userId!,
        applicationId: app.id,
        amount: withdrawAmount.toFixed(2),
        status: "pending",
        bankCountry,
        bankName,
        bankAccountNumber,
        bankAccountName,
        swiftCode: swiftCode || null,
      })
      .returning();

    await db.insert(notificationsTable).values({
      userId: req.userId!,
      message: `Your withdrawal request of $${withdrawAmount.toLocaleString()} has been submitted and is under review.`,
      read: false,
    });

    res.status(201).json({ ...withdrawal, amount: parseFloat(withdrawal.amount) });
  } catch (error) {
    console.error("Create withdrawal error:", error);
    res.status(500).json({ error: "Failed to submit withdrawal request" });
  }
});

export default router;
