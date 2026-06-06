import axios from "axios";

const MPESA_BASE_URL = process.env.MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "";
const SHORTCODE = process.env.MPESA_SHORTCODE || "4167853";
const PASSKEY = process.env.MPESA_PASSKEY || "";
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL || "";

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

function getTimestamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
}

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  accountRef: string;
  description: string;
}): Promise<{ checkoutRequestId: string; merchantRequestId: string }> {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");

  // Normalize phone: ensure starts with 254
  let phone = params.phone.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "254" + phone.slice(1);
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (!phone.startsWith("254")) phone = "254" + phone;

  const body = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.ceil(params.amount),
    PartyA: phone,
    PartyB: SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: CALLBACK_URL,
    AccountReference: params.accountRef,
    TransactionDesc: params.description,
  };

  const res = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    body,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );

  if (res.data.ResponseCode !== "0") {
    throw new Error(res.data.ResponseDescription || "STK push failed");
  }

  return {
    checkoutRequestId: res.data.CheckoutRequestID,
    merchantRequestId: res.data.MerchantRequestID,
  };
}

// Calculate processing fee in KES based on product type
export function getProcessingFeeKes(type: string, category: string): number {
  if (type === "grant" && category === "personal") return 1300;
  if (type === "grant" && category === "business") return 2600;
  if (type === "loan" && category === "personal") return 2600;
  if (type === "loan" && category === "business") return 6500;
  return 1300;
}
