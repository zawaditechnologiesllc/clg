import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import applicationsRouter from "./applications.js";
import notificationsRouter from "./notifications.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/applications", applicationsRouter);
router.use("/notifications", notificationsRouter);
router.use("/admin", adminRouter);

export default router;
