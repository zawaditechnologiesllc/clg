import { Router } from "express";
import { db } from "@workspace/db";
import {
  applicationsTable,
  notificationsTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.js";
import { initiateStkPush, getProcessingFeeKes } from "../lib/mpesa.js";

const router = Router();

function parseApp(a: typeof applicationsTable.$inferSelect) {
  return {
    ...a,
    amountRequested: parseFloat(a.amountRequested),
    preapprovedAmount: a.preapprovedAmount ? parseFloat(a.preapprovedAmount) : null,
    approvedAmount: a.approvedAmount ? parseFloat(a.approvedAmount) : null,
    availableBalance: a.availableBalance ? parseFloat(a.availableBalance) : 0,
    processingFeeKes: a.processingFeeKes ? parseFloat(a.processingFeeKes) : null,
    monthlyIncome: a.monthlyIncome ? parseFloat(a.monthlyIncome) : null,
    annualRevenue: a.annualRevenue ? parseFloat(a.annualRevenue) : null,
    documentPaths: a.documentPaths ? JSON.parse(a.documentPaths) : [],
  };
}

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Auto-release check: mark released if release date passed
    const apps = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.userId, req.userId!))
      .orderBy(applicationsTable.createdAt);

    const now = new Date();
    for (const app of apps) {
      if (
        app.status === "approved" &&
        !app.isReleased &&
        app.releaseDate &&
        app.releaseDate <= now
      ) {
        await db
          .update(applicationsTable)
          .set({ isReleased: true, availableBalance: app.approvedAmount, updatedAt: now })
          .where(eq(applicationsTable.id, app.id));
        // notify user
        await db.insert(notificationsTable).values({
          userId: app.userId,
          message: `Your funds for application #${app.id} are now available! Log in to request your withdrawal.`,
          read: false,
        });
      }
    }

    const updated = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.userId, req.userId!))
      .orderBy(applicationsTable.createdAt);

    res.json(updated.map(parseApp));
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.post("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      type, category, amountRequested,
      fullName, nationalId, phoneNumber, employmentStatus, monthlyIncome, purposeOfFunds,
      businessName, registrationNumber, kraPin, businessType, annualRevenue, ownerDetails,
      documentPaths,
      payoutBankCountry, payoutBankName, payoutBankAccountNumber, payoutBankAccountName, payoutSwiftCode,
    } = req.body;

    if (!type || !category || !amountRequested || !purposeOfFunds) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const preapprovedAmount = type === "loan"
      ? (parseFloat(amountRequested) * 0.65).toFixed(2)
      : (parseFloat(amountRequested) * 0.80).toFixed(2);

    const feeKes = getProcessingFeeKes(type, category);

    const [app] = await db
      .insert(applicationsTable)
      .values({
        userId: req.userId!,
        type,
        category,
        amountRequested: parseFloat(amountRequested).toFixed(2),
        preapprovedAmount,
        processingFeeKes: feeKes.toFixed(2),
        status: "pending",
        fullName,
        nationalId,
        phoneNumber,
        employmentStatus,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome).toFixed(2) : null,
        purposeOfFunds,
        businessName,
        registrationNumber,
        kraPin,
        businessType,
        annualRevenue: annualRevenue ? parseFloat(annualRevenue).toFixed(2) : null,
        ownerDetails,
        documentPaths: documentPaths ? JSON.stringify(documentPaths) : null,
        payoutBankCountry,
        payoutBankName,
        payoutBankAccountNumber,
        payoutBankAccountName,
        payoutSwiftCode,
      })
      .returning();

    await db.insert(notificationsTable).values({
      userId: req.userId!,
      message: `Your ${category} ${type} application #${app.id} has been submitted. Complete your processing fee payment to proceed.`,
      read: false,
    });

    res.status(201).json(parseApp(app));
  } catch (error) {
    console.error("Create application error:", error);
    res.status(500).json({ error: "Failed to create application" });
  }
});

router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(and(eq(applicationsTable.id, id), eq(applicationsTable.userId, req.userId!)))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json(parseApp(app));
  } catch (error) {
    console.error("Get application error:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Initiate M-Pesa STK push
router.post("/:id/stk-push", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      res.status(400).json({ error: "Phone number is required for M-Pesa payment" });
      return;
    }

    const [app] = await db
      .select()
      .from(applicationsTable)
      .where(and(eq(applicationsTable.id, id), eq(applicationsTable.userId, req.userId!)))
      .limit(1);

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (app.paymentStatus === "completed") {
      res.status(400).json({ error: "Payment already completed" });
      return;
    }

    const feeKes = app.processingFeeKes ? parseFloat(app.processingFeeKes) : getProcessingFeeKes(app.type, app.category);

    try {
      const result = await initiateStkPush({
        phone: phoneNumber,
        amount: feeKes,
        accountRef: `CLG-${id}`,
        description: "Processing Fee",
      });

      await db
        .update(applicationsTable)
        .set({
          mpesaCheckoutRequestId: result.checkoutRequestId,
          paymentStatus: "processing",
          phoneNumber: phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(applicationsTable.id, id));

      res.json({
        success: true,
        message: "M-Pesa prompt sent to your phone. Enter your PIN to complete payment.",
        checkoutRequestId: result.checkoutRequestId,
      });
    } catch (mpesaError: any) {
      console.error("STK push failed:", mpesaError.message);
      // STK push failed — return fallback info
      res.json({
        success: false,
        fallback: true,
        message: "M-Pesa prompt could not be sent. Please use the paybill option below.",
        paybill: {
          number: "4167853",
          account: app.fullName || "Your Full Name",
          amount: feeKes,
        },
      });
    }
  } catch (error) {
    console.error("STK push error:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Submit manual payment code (after STK push or paybill)
router.post("/:id/payment", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const { paymentCode } = req.body;
    if (!paymentCode || !paymentCode.trim()) {
      res.status(400).json({ error: "Payment confirmation code is required" });
      return;
    }

    const [existing] = await db
      .select()
      .from(applicationsTable)
      .where(and(eq(applicationsTable.id, id), eq(applicationsTable.userId, req.userId!)))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const [app] = await db
      .update(applicationsTable)
      .set({
        paymentCode: paymentCode.trim(),
        paymentStatus: "completed",
        status: "under_review",
        updatedAt: new Date(),
      })
      .where(eq(applicationsTable.id, id))
      .returning();

    await db.insert(notificationsTable).values({
      userId: req.userId!,
      message: `Processing fee confirmed for application #${app.id}. Your application is under review. Expected response: 2–3 business days.`,
      read: false,
    });

    res.json(parseApp(app));
  } catch (error) {
    console.error("Submit payment error:", error);
    res.status(500).json({ error: "Failed to submit payment" });
  }
});

// Update payout method for an application
router.patch("/:id/payout", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return }

    const { payoutBankCountry, payoutBankName, payoutBankAccountNumber, payoutBankAccountName, payoutSwiftCode } = req.body;

    const [app] = await db
      .update(applicationsTable)
      .set({
        payoutBankCountry: payoutBankCountry || null,
        payoutBankName: payoutBankName || null,
        payoutBankAccountNumber: payoutBankAccountNumber || null,
        payoutBankAccountName: payoutBankAccountName || null,
        payoutSwiftCode: payoutSwiftCode || null,
        updatedAt: new Date(),
      })
      .where(and(eq(applicationsTable.id, id), eq(applicationsTable.userId, req.userId!)))
      .returning();

    if (!app) { res.status(404).json({ error: "Application not found" }); return }
    res.json(parseApp(app));
  } catch (error) {
    console.error("Update payout error:", error);
    res.status(500).json({ error: "Failed to update payout method" });
  }
});

export default router;
