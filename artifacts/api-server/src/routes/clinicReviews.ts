import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, clinicReviewsTable, clinicsTable } from "@workspace/db";
import {
  ListClinicReviewsParams,
  ListClinicReviewsResponse,
  CreateClinicReviewParams,
  CreateClinicReviewBody,
  CreateClinicReviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clinics/:id/reviews", async (req, res): Promise<void> => {
  const params = ListClinicReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const reviews = await db
    .select()
    .from(clinicReviewsTable)
    .where(eq(clinicReviewsTable.clinicId, params.data.id))
    .orderBy(desc(clinicReviewsTable.createdAt));

  res.json(ListClinicReviewsResponse.parse(reviews));
});

router.post("/clinics/:id/reviews", async (req, res): Promise<void> => {
  const params = CreateClinicReviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = CreateClinicReviewBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [clinic] = await db
    .select({ id: clinicsTable.id })
    .from(clinicsTable)
    .where(eq(clinicsTable.id, params.data.id));

  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  const [review] = await db
    .insert(clinicReviewsTable)
    .values({
      clinicId: params.data.id,
      authorName: body.data.authorName,
      rating: body.data.rating,
      reportedWaitDays: body.data.reportedWaitDays ?? null,
      comment: body.data.comment ?? null,
    })
    .returning();

  res.status(201).json(CreateClinicReviewResponse.parse(review));
});

export default router;
