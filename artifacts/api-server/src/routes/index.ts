import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicsRouter from "./clinics";
import insurancePlansRouter from "./insurancePlans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicsRouter);
router.use(insurancePlansRouter);

export default router;
