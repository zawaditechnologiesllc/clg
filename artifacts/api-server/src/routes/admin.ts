import { Router } from "express";
import { db } from "@workspace/db";
import {
  applicationsTable,
  notificationsTable,
  adminActionsTable,
  usersTable,
  withdrawalsTable,
} from "@workspace/db/schema";
import { eq, desc, isNotNull, or } from "drizzle-orm";
import { requireAdmin, AuthenticatedRequest } from "../middlewares/auth.js";
import { sendApprovalEmail } from "../lib/email.js";

const router = Router();

function parseApp(app: typeof applicationsTable.$inferSelect, user?: { email: string; fullName: string }) {
  return {
    ...app,
    amountRequested: parseFloat(app.amountRequested),
    preapprovedAmount: app.preapprovedAmount ? parseFloat(app.preapprovedAmount) : null,
    approvedAmount: app.approvedAmount ? parseFloat(app.approvedAmount) : null,
    availableBalance: app.availableBalance ? parseFloat(app.availableBalance) : 0,
    processingFeeKes: app.processingFeeKes ? parseFloat(app.processingFeeKes) : null,
    monthlyIncome: app.monthlyIncome ? parseFloat(app.monthlyIncome) : null,
    annualRevenue: app.annualRevenue ? parseFloat(app.annualRevenue) : null,
    documentPaths: app.documentPaths ? JSON.parse(app.documentPaths) : [],
    ...(user ? { userEmail: user.email, userFullName: user.fullName } : {}),
  };
}

// List all applications
router.get("/applications", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const allApps = await db
      .select({ app: applicationsTable, user: { email: usersTable.email, fullName: usersTable.fullName } })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .orderBy(desc(applicationsTable.createdAt));

    let filtered = allApps;
    if (type) filtered = filtered.filter((r: typeof allApps[0]) => r.app.type === type);
    if (status) filtered = filtered.filter((r: typeof allApps[0]) => r.app.status === status);

    res.json(filtered.map(({ app, user }) => parseApp(app, user)));
  } catch (error) {
    console.error("Admin get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Get single application (admin view)
router.get("/applications/:id", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const [row] = await db
      .select({ app: applicationsTable, user: { email: usersTable.email, fullName: usersTable.fullName } })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .where(eq(applicationsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json(parseApp(row.app, row.user));
  } catch (error) {
    console.error("Admin get application error:", error);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

// Approve application — admin sets approved amount + release date
router.post("/applications/:id/approve", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const { reason, approvedAmount, releaseDateStr } = req.body;
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: "Approval note is required" });
      return;
    }
    if (!approvedAmount || isNaN(parseFloat(approvedAmount))) {
      res.status(400).json({ error: "Approved amount is required" });
      return;
    }
    if (!releaseDateStr) {
      res.status(400).json({ error: "Release date is required" });
      return;
    }

    const releaseDate = new Date(releaseDateStr);
    if (isNaN(releaseDate.getTime())) {
      res.status(400).json({ error: "Invalid release date" });
      return;
    }

    // Check if release date is in the past → auto-release
    const now = new Date();
    const isReleased = releaseDate <= now;

    const [app] = await db
      .update(applicationsTable)
      .set({
        status: "approved",
        approvedAmount: parseFloat(approvedAmount).toFixed(2),
        releaseDate,
        isReleased,
        availableBalance: isReleased ? parseFloat(approvedAmount).toFixed(2) : "0",
        adminComment: reason.trim(),
        updatedAt: now,
      })
      .where(eq(applicationsTable.id, id))
      .returning();

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db.insert(adminActionsTable).values({
      applicationId: id,
      adminId: req.userId!,
      action: "approved",
      reason: reason.trim(),
    });

    const releaseDateFormatted = releaseDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    await db.insert(notificationsTable).values({
      userId: app.userId,
      message: `🎉 Congratulations! Your ${app.category} ${app.type} application #${app.id} has been approved for $${parseFloat(approvedAmount).toLocaleString()}. Funds will be available on ${releaseDateFormatted}.`,
      read: false,
    });

    // Get user email for notification
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, app.userId)).limit(1);
    if (user) {
      sendApprovalEmail(user.email, user.fullName, id, parseFloat(approvedAmount), releaseDate).catch(console.error);
    }

    res.json(parseApp(app));
  } catch (error) {
    console.error("Approve application error:", error);
    res.status(500).json({ error: "Failed to approve application" });
  }
});

// Reject application
router.post("/applications/:id/reject", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: "Rejection reason is required" });
      return;
    }

    const [app] = await db
      .update(applicationsTable)
      .set({ status: "rejected", adminComment: reason.trim(), updatedAt: new Date() })
      .where(eq(applicationsTable.id, id))
      .returning();

    if (!app) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await db.insert(adminActionsTable).values({
      applicationId: id,
      adminId: req.userId!,
      action: "rejected",
      reason: reason.trim(),
    });

    await db.insert(notificationsTable).values({
      userId: app.userId,
      message: `Your ${app.category} ${app.type} application #${app.id} was not approved at this time. Reason: ${reason}. Contact us at info@cardoneloansgrants.org for assistance.`,
      read: false,
    });

    res.json(parseApp(app));
  } catch (error) {
    console.error("Reject application error:", error);
    res.status(500).json({ error: "Failed to reject application" });
  }
});

// Manually release funds (before scheduled date)
router.post("/applications/:id/release", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid application ID" });
      return;
    }

    const [existing] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    if (existing.status !== "approved") {
      res.status(400).json({ error: "Application must be approved before releasing funds" });
      return;
    }

    const [app] = await db
      .update(applicationsTable)
      .set({
        isReleased: true,
        availableBalance: existing.approvedAmount,
        updatedAt: new Date(),
      })
      .where(eq(applicationsTable.id, id))
      .returning();

    await db.insert(notificationsTable).values({
      userId: app.userId,
      message: `Your funds for application #${app.id} ($${parseFloat(app.approvedAmount || "0").toLocaleString()}) have been released and are now available for withdrawal!`,
      read: false,
    });

    res.json(parseApp(app));
  } catch (error) {
    console.error("Release funds error:", error);
    res.status(500).json({ error: "Failed to release funds" });
  }
});

// List all withdrawal requests
router.get("/withdrawals", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const status = req.query.status as string | undefined;

    const allWithdrawals = await db
      .select({
        withdrawal: withdrawalsTable,
        user: { email: usersTable.email, fullName: usersTable.fullName },
      })
      .from(withdrawalsTable)
      .innerJoin(usersTable, eq(withdrawalsTable.userId, usersTable.id))
      .orderBy(desc(withdrawalsTable.createdAt));

    let filtered = allWithdrawals;
    if (status) filtered = filtered.filter((r: typeof allWithdrawals[0]) => r.withdrawal.status === status);

    res.json(
      filtered.map(({ withdrawal, user }) => ({
        ...withdrawal,
        amount: parseFloat(withdrawal.amount),
        userEmail: user.email,
        userFullName: user.fullName,
      }))
    );
  } catch (error) {
    console.error("Admin get withdrawals error:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// Approve withdrawal
router.post("/withdrawals/:id/approve", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid withdrawal ID" });
      return;
    }

    const { comment } = req.body;

    const [withdrawal] = await db
      .select()
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.id, id))
      .limit(1);

    if (!withdrawal) {
      res.status(404).json({ error: "Withdrawal not found" });
      return;
    }

    const [updated] = await db
      .update(withdrawalsTable)
      .set({ status: "approved", adminComment: comment || null, updatedAt: new Date() })
      .where(eq(withdrawalsTable.id, id))
      .returning();

    // Deduct from available balance
    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, withdrawal.applicationId)).limit(1);
    if (app) {
      const newBalance = Math.max(0, parseFloat(app.availableBalance || "0") - parseFloat(withdrawal.amount));
      await db
        .update(applicationsTable)
        .set({ availableBalance: newBalance.toFixed(2), updatedAt: new Date() })
        .where(eq(applicationsTable.id, withdrawal.applicationId));
    }

    await db.insert(notificationsTable).values({
      userId: withdrawal.userId,
      message: `Your withdrawal request of $${parseFloat(withdrawal.amount).toLocaleString()} has been approved and is being processed to your ${withdrawal.bankName} account.`,
      read: false,
    });

    res.json({ ...updated, amount: parseFloat(updated.amount) });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    res.status(500).json({ error: "Failed to approve withdrawal" });
  }
});

// Reject withdrawal
router.post("/withdrawals/:id/reject", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid withdrawal ID" });
      return;
    }

    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: "Rejection reason is required" });
      return;
    }

    const [withdrawal] = await db
      .select()
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.id, id))
      .limit(1);

    if (!withdrawal) {
      res.status(404).json({ error: "Withdrawal not found" });
      return;
    }

    const [updated] = await db
      .update(withdrawalsTable)
      .set({ status: "rejected", adminComment: reason.trim(), updatedAt: new Date() })
      .where(eq(withdrawalsTable.id, id))
      .returning();

    // Restore balance
    const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, withdrawal.applicationId)).limit(1);
    if (app) {
      const restored = parseFloat(app.availableBalance || "0") + parseFloat(withdrawal.amount);
      await db
        .update(applicationsTable)
        .set({ availableBalance: restored.toFixed(2), updatedAt: new Date() })
        .where(eq(applicationsTable.id, withdrawal.applicationId));
    }

    await db.insert(notificationsTable).values({
      userId: withdrawal.userId,
      message: `Your withdrawal request of $${parseFloat(withdrawal.amount).toLocaleString()} was not processed. Reason: ${reason}. Funds restored to your balance.`,
      read: false,
    });

    res.json({ ...updated, amount: parseFloat(updated.amount) });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    res.status(500).json({ error: "Failed to reject withdrawal" });
  }
});

// Dashboard stats
router.get("/stats", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allApps = await db
      .select({ app: applicationsTable, user: { email: usersTable.email, fullName: usersTable.fullName } })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .orderBy(desc(applicationsTable.createdAt));

    const pendingWithdrawals = await db
      .select({ count: withdrawalsTable.id })
      .from(withdrawalsTable)
      .where(eq(withdrawalsTable.status, "pending"));

    const total = allApps.length;
    const pending = allApps.filter((r) => r.app.status === "pending").length;
    const underReview = allApps.filter((r) => r.app.status === "under_review").length;
    const approved = allApps.filter((r) => r.app.status === "approved").length;
    const rejected = allApps.filter((r) => r.app.status === "rejected").length;
    const loans = allApps.filter((r) => r.app.type === "loan").length;
    const grants = allApps.filter((r) => r.app.type === "grant").length;

    const totalApprovedAmount = allApps
      .filter((r) => r.app.approvedAmount)
      .reduce((sum, r) => sum + parseFloat(r.app.approvedAmount || "0"), 0);

    const recent = allApps.slice(0, 10).map(({ app, user }) => parseApp(app, user));

    res.json({
      totalApplications: total,
      pendingApplications: pending,
      underReviewApplications: underReview,
      approvedApplications: approved,
      rejectedApplications: rejected,
      totalLoans: loans,
      totalGrants: grants,
      totalApprovedAmount,
      pendingWithdrawals: pendingWithdrawals.length,
      recentApplications: recent,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// List all users
router.get("/users", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        fullName: usersTable.fullName,
        role: usersTable.role,
        emailConfirmed: usersTable.emailConfirmed,
        phoneNumber: usersTable.phoneNumber,
        bankCountry: usersTable.bankCountry,
        bankName: usersTable.bankName,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));

    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// List applications that have submitted a payment (admin payment review queue)
router.get("/payments", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await db
      .select({ app: applicationsTable, user: { email: usersTable.email, fullName: usersTable.fullName } })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .where(or(isNotNull(applicationsTable.paymentCode), isNotNull(applicationsTable.mpesaCheckoutRequestId)))
      .orderBy(desc(applicationsTable.createdAt));
    res.json(rows.map(({ app, user }) => parseApp(app, user)));
  } catch (error) {
    console.error("Admin get payments error:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Verify (approve) or reject a submitted payment
router.post("/payments/:id/verify", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const id = parseInt(String(req.params.id));
    if (isNaN(id)) { res.status(400).json({ error: "Invalid application ID" }); return; }

    const { action, comment } = req.body;
    if (!["approve", "reject"].includes(action)) {
      res.status(400).json({ error: "action must be 'approve' or 'reject'" }); return;
    }

    const [existing] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id)).limit(1);
    if (!existing) { res.status(404).json({ error: "Application not found" }); return; }

    const updates =
      action === "approve"
        ? { paymentStatus: "completed" as const, status: "under_review" as const, updatedAt: new Date() }
        : { paymentStatus: "failed" as const, adminComment: comment || "Payment could not be verified.", updatedAt: new Date() };

    const [updated] = await db
      .update(applicationsTable)
      .set(updates)
      .where(eq(applicationsTable.id, id))
      .returning();

    await db.insert(notificationsTable).values({
      userId: existing.userId,
      message:
        action === "approve"
          ? `Your processing fee payment for application #${id} has been verified. Your application is now under expert review.`
          : `Your processing fee payment for application #${id} could not be verified. Reason: ${comment || "Payment verification failed"}. Please contact info@cardoneloansgrants.org.`,
      read: false,
    });

    res.json(parseApp(updated));
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ error: "Failed to process payment verification" });
  }
});

export default router;
