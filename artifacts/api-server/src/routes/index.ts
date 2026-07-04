import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clinicsRouter from "./clinics";
import insurancePlansRouter from "./insurancePlans";
import doctorsRouter from "./doctors";
import clinicReviewsRouter from "./clinicReviews";
import appointmentsRouter from "./appointments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clinicsRouter);
router.use(insurancePlansRouter);
router.use(doctorsRouter);
router.use(clinicReviewsRouter);
router.use(appointmentsRouter);

export default router;
