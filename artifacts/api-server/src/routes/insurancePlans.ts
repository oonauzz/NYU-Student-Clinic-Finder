import { Router, type IRouter } from "express";
import { db, insurancePlansTable } from "@workspace/db";
import { ListInsurancePlansResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/insurance-plans", async (_req, res): Promise<void> => {
  const plans = await db.select().from(insurancePlansTable);
  res.json(ListInsurancePlansResponse.parse(plans));
});

export default router;
