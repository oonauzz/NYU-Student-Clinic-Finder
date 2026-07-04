import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicsRouter from "./clinics";
import insurancePlansRouter from "./insurancePlans";
import doctorsRouter from "./doctors";
import clinicReviewsRouter from "./clinicReviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicsRouter);
router.use(insurancePlansRouter);
router.use(doctorsRouter);
router.use(clinicReviewsRouter);

export default router;
