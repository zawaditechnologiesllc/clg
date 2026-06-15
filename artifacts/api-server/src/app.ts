import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import router from "./routes/index.js";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

const app: Express = express();

// Render/Vercel terminate TLS at a proxy. Trust it so express-session issues
// `secure` cookies and req.protocol reflects the original (https) scheme.
app.set("trust proxy", 1);

// Origins allowed to make credentialed cross-origin requests. FRONTEND_URL may
// be a comma-separated list (e.g. apex + www, or a custom + Vercel domain).
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins,
  "https://cardoneloansgrants.org",
  "https://www.cardoneloansgrants.org",
  "http://localhost:5173",
  "http://localhost:3000",
];

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true;
  // Allow this project's own subdomains and Vercel preview/production deploys.
  try {
    const { hostname } = new URL(origin);
    if (hostname === "cardoneloansgrants.org") return true;
    if (hostname.endsWith(".cardoneloansgrants.org")) return true;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
}

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser/server-to-server calls (no Origin header) and any
      // explicitly allowed origin. Disallowed origins get a response without
      // CORS headers (the browser blocks it) rather than a 500 from a throw.
      if (!origin || isAllowedOrigin(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cardone-loans-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use("/api", router);

export default app;
