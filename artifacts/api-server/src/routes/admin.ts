import { Router } from "express";
import { db } from "@workspace/db";
import {
  applicationsTable,
  notificationsTable,
  adminActionsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { requireAdmin, AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

router.get("/applications", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { type, status } = req.query;

    const allApps = await db
      .select({
        app: applicationsTable,
        user: {
          email: usersTable.email,
          fullName: usersTable.fullName,
        },
      })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .orderBy(desc(applicationsTable.createdAt));

    let filtered = allApps;
    if (type) {
      filtered = filtered.filter((r) => r.app.type === type);
    }
    if (status) {
      filtered = filtered.filter((r) => r.app.status === status);
    }

    res.json(
      filtered.map(({ app, user }) => ({
        ...app,
        amountRequested: parseFloat(app.amountRequested),
        preapprovedAmount: app.preapprovedAmount
          ? parseFloat(app.preapprovedAmount)
          : null,
        monthlyIncome: app.monthlyIncome ? parseFloat(app.monthlyIncome) : null,
        annualRevenue: app.annualRevenue ? parseFloat(app.annualRevenue) : null,
        userEmail: user.email,
        userFullName: user.fullName,
      }))
    );
  } catch (error) {
    console.error("Admin get applications error:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.post(
  "/applications/:id/approve",
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid application ID" });
        return;
      }

      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        res.status(400).json({ error: "Reason is required" });
        return;
      }

      const [app] = await db
        .update(applicationsTable)
        .set({
          status: "approved",
          adminComment: reason.trim(),
          updatedAt: new Date(),
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

      await db.insert(notificationsTable).values({
        userId: app.userId,
        message: `Congratulations! Your ${app.category} ${app.type} application #${app.id} has been approved. Disbursement will occur within 14 days. Note: ${reason}`,
        read: false,
      });

      res.json({
        ...app,
        amountRequested: parseFloat(app.amountRequested),
        preapprovedAmount: app.preapprovedAmount
          ? parseFloat(app.preapprovedAmount)
          : null,
        monthlyIncome: app.monthlyIncome ? parseFloat(app.monthlyIncome) : null,
        annualRevenue: app.annualRevenue ? parseFloat(app.annualRevenue) : null,
      });
    } catch (error) {
      console.error("Approve application error:", error);
      res.status(500).json({ error: "Failed to approve application" });
    }
  }
);

router.post(
  "/applications/:id/reject",
  requireAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: "Invalid application ID" });
        return;
      }

      const { reason } = req.body;
      if (!reason || !reason.trim()) {
        res.status(400).json({ error: "Reason is required" });
        return;
      }

      const [app] = await db
        .update(applicationsTable)
        .set({
          status: "rejected",
          adminComment: reason.trim(),
          updatedAt: new Date(),
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
        action: "rejected",
        reason: reason.trim(),
      });

      await db.insert(notificationsTable).values({
        userId: app.userId,
        message: `Your ${app.category} ${app.type} application #${app.id} was not approved. Reason: ${reason}. You may re-apply or contact support at info@cardoneloansgrants.org`,
        read: false,
      });

      res.json({
        ...app,
        amountRequested: parseFloat(app.amountRequested),
        preapprovedAmount: app.preapprovedAmount
          ? parseFloat(app.preapprovedAmount)
          : null,
        monthlyIncome: app.monthlyIncome ? parseFloat(app.monthlyIncome) : null,
        annualRevenue: app.annualRevenue ? parseFloat(app.annualRevenue) : null,
      });
    } catch (error) {
      console.error("Reject application error:", error);
      res.status(500).json({ error: "Failed to reject application" });
    }
  }
);

router.get("/stats", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const allApps = await db
      .select({
        app: applicationsTable,
        user: {
          email: usersTable.email,
          fullName: usersTable.fullName,
        },
      })
      .from(applicationsTable)
      .innerJoin(usersTable, eq(applicationsTable.userId, usersTable.id))
      .orderBy(desc(applicationsTable.createdAt));

    const total = allApps.length;
    const pending = allApps.filter((r) => r.app.status === "pending").length;
    const underReview = allApps.filter((r) => r.app.status === "under_review").length;
    const approved = allApps.filter((r) => r.app.status === "approved").length;
    const rejected = allApps.filter((r) => r.app.status === "rejected").length;
    const loans = allApps.filter((r) => r.app.type === "loan").length;
    const grants = allApps.filter((r) => r.app.type === "grant").length;

    const recent = allApps.slice(0, 10).map(({ app, user }) => ({
      ...app,
      amountRequested: parseFloat(app.amountRequested),
      preapprovedAmount: app.preapprovedAmount ? parseFloat(app.preapprovedAmount) : null,
      monthlyIncome: app.monthlyIncome ? parseFloat(app.monthlyIncome) : null,
      annualRevenue: app.annualRevenue ? parseFloat(app.annualRevenue) : null,
      userEmail: user.email,
      userFullName: user.fullName,
    }));

    res.json({
      totalApplications: total,
      pendingApplications: pending,
      underReviewApplications: underReview,
      approvedApplications: approved,
      rejectedApplications: rejected,
      totalLoans: loans,
      totalGrants: grants,
      recentApplications: recent,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
