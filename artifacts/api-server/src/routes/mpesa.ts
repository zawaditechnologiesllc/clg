import { Router } from "express";
import { db } from "@workspace/db";
import { applicationsTable, notificationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// M-Pesa STK callback endpoint (called by Safaricom servers)
router.post("/callback", async (req, res) => {
  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      return;
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

    // Find application by checkout request ID
    const apps = await db
      .select()
      .from(applicationsTable)
      .where(eq(applicationsTable.mpesaCheckoutRequestId, CheckoutRequestID))
      .limit(1);

    const app = apps[0];
    if (!app) {
      res.json({ ResultCode: 0, ResultDesc: "Accepted" });
      return;
    }

    if (ResultCode === 0) {
      // Payment successful
      let mpesaReceiptNumber = "";
      if (CallbackMetadata?.Item) {
        const receiptItem = CallbackMetadata.Item.find((i: any) => i.Name === "MpesaReceiptNumber");
        if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
      }

      await db
        .update(applicationsTable)
        .set({
          paymentCode: mpesaReceiptNumber,
          paymentStatus: "completed",
          status: "under_review",
          updatedAt: new Date(),
        })
        .where(eq(applicationsTable.id, app.id));

      await db.insert(notificationsTable).values({
        userId: app.userId,
        message: `Processing fee confirmed (M-Pesa ref: ${mpesaReceiptNumber}). Your application #${app.id} is now under review. Expected response: 2–3 business days.`,
        read: false,
      });
    } else {
      // Payment failed
      await db
        .update(applicationsTable)
        .set({ paymentStatus: "failed", updatedAt: new Date() })
        .where(eq(applicationsTable.id, app.id));

      await db.insert(notificationsTable).values({
        userId: app.userId,
        message: `M-Pesa payment for application #${app.id} was not completed. Please try again or use the paybill option.`,
        read: false,
      });
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

export default router;
