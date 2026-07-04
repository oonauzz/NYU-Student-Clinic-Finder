import { Router, type IRouter } from "express";
import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db, clinicsTable } from "@workspace/db";
import {
  ListClinicsQueryParams,
  ListClinicsResponse,
  GetClinicParams,
  GetClinicResponse,
  GetClinicsSummaryResponse,
  ListSpecialtiesResponse,
  ListNeighborhoodsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/clinics/summary", async (_req, res): Promise<void> => {
  const clinics = await db.select().from(clinicsTable);

  const totalClinics = clinics.length;
  const averageWaitDays =
    totalClinics === 0
      ? 0
      : clinics.reduce((sum, c) => sum + c.averageWaitDays, 0) / totalClinics;
  const walkInCount = clinics.filter((c) => c.walkInAvailable).length;

  const specialtyCounts = new Map<string, number>();
  for (const clinic of clinics) {
    specialtyCounts.set(
      clinic.specialty,
      (specialtyCounts.get(clinic.specialty) ?? 0) + 1,
    );
  }

  const specialtyBreakdown = Array.from(specialtyCounts.entries()).map(
    ([specialty, count]) => ({ specialty, count }),
  );

  res.json(
    GetClinicsSummaryResponse.parse({
      totalClinics,
      averageWaitDays,
      walkInCount,
      specialtyBreakdown,
    }),
  );
});

router.get("/clinics/specialties", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ specialty: clinicsTable.specialty })
    .from(clinicsTable)
    .orderBy(clinicsTable.specialty);

  res.json(ListSpecialtiesResponse.parse(rows.map((r) => r.specialty)));
});

router.get("/clinics/neighborhoods", async (_req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ neighborhood: clinicsTable.neighborhood })
    .from(clinicsTable)
    .orderBy(clinicsTable.neighborhood);

  res.json(ListNeighborhoodsResponse.parse(rows.map((r) => r.neighborhood)));
});

router.get("/clinics", async (req, res): Promise<void> => {
  const query = ListClinicsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { specialty, neighborhood, acceptsNyuInsurance, search } = query.data;

  const conditions = [];
  if (specialty) {
    conditions.push(eq(clinicsTable.specialty, specialty));
  }
  if (neighborhood) {
    conditions.push(eq(clinicsTable.neighborhood, neighborhood));
  }
  if (acceptsNyuInsurance !== undefined) {
    conditions.push(eq(clinicsTable.acceptsNyuInsurance, acceptsNyuInsurance));
  }
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(ilike(clinicsTable.name, term), ilike(clinicsTable.specialty, term)),
    );
  }

  const clinics = await db
    .select()
    .from(clinicsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(clinicsTable.averageWaitDays);

  res.json(ListClinicsResponse.parse(clinics));
});

router.get("/clinics/:id", async (req, res): Promise<void> => {
  const params = GetClinicParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [clinic] = await db
    .select()
    .from(clinicsTable)
    .where(eq(clinicsTable.id, params.data.id));

  if (!clinic) {
    res.status(404).json({ error: "Clinic not found" });
    return;
  }

  res.json(GetClinicResponse.parse(clinic));
});

export default router;
