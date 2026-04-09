import { Router } from "express";
import healthRouter from "./health.routes.js";
import authRouter from "./auth.routes.js";
import employeeRouter from "./employee.routes.js";
import onboardingRouter from "./onboarding.routes.js";
import documentRouter from "./document.routes.js";
import faqRouter from "./faq.routes.js";
import chatRouter from "./chat.routes.js";
import emailRouter from "./email.routes.js";
import adminRouter from "./admin.routes.js";
import notificationRouter from "./notification.routes.js";
import contactRouter from "./contact.routes.js";
import { authMiddleware } from "../middleware/auth.js";

const rootRouter = Router();

rootRouter.use(healthRouter);
rootRouter.use("/api/auth", authRouter);
rootRouter.use("/api", authMiddleware);
rootRouter.use("/api/employees", employeeRouter);
rootRouter.use("/api/onboarding", onboardingRouter);
rootRouter.use("/api/documents", documentRouter);
rootRouter.use("/api/faqs", faqRouter);
rootRouter.use("/api/chat", chatRouter);
rootRouter.use("/api/email", emailRouter);
rootRouter.use("/api/admin", adminRouter);
rootRouter.use("/api/notifications", notificationRouter);
rootRouter.use("/api/contacts", contactRouter);

export default rootRouter;
