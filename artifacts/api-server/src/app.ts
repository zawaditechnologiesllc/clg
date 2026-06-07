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

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server calls (no Origin header) and listed origins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true)
    cb(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: true,
}));
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
