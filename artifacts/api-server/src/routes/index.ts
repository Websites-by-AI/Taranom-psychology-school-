import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import recordsRouter from "./records";
import analysisRouter from "./analysis";
import examRouter from "./exam";
import statsRouter from "./stats";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(recordsRouter);
router.use(analysisRouter);
router.use(examRouter);
router.use(statsRouter);
router.use(adminRouter);

export default router;
