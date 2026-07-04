import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, doctorsTable } from "@workspace/db";
import { ListClinicDoctorsParams, ListClinicDoctorsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clinics/:id/doctors", async (req, res): Promise<void> => {
  const params = ListClinicDoctorsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const doctors = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.clinicId, params.data.id))
    .orderBy(asc(doctorsTable.nextAvailableAt));

  res.json(ListClinicDoctorsResponse.parse(doctors));
});

export default router;
