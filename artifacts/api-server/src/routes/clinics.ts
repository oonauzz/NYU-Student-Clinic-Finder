import { Router, type IRouter } from "express";
import { and, eq, ilike, or, inArray } from "drizzle-orm";
import { db, clinicsTable, clinicInsurancePlansTable, insurancePlansTable, type Clinic } from "@workspace/db";
import {
  ListClinicsQueryParams,
  ListClinicsResponse,
  GetClinicParams,
  GetClinicResponse,
  GetClinicsSummaryResponse,
  ListSpecialtiesResponse,
  ListNeighborhoodsResponse,
  ListBoroughsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function attachInsurancePlans(clinics: Clinic[]) {
  if (clinics.length === 0) return [];

  const rows = await db
    .select({
      clinicId: clinicInsurancePlansTable.clinicId,
      plan: insurancePlansTable,
    })
    .from(clinicInsurancePlansTable)
    .innerJoin(insurancePlansTable, eq(clinicInsurancePlansTable.insurancePlanId, insurancePlansTable.id))
    .where(
      inArray(
        clinicInsurancePlansTable.clinicId,
        clinics.map((c) => c.id),
      ),
    );

  const plansByClinic = new Map<number, typeof rows[number]["plan"][]>();
  for (const row of rows) {
    const list = plansByClinic.get(row.clinicId) ?? [];
    list.push(row.plan);
    plansByClinic.set(row.clinicId, list);
  }

  return clinics.map((clinic) => ({
    ...clinic,
    acceptedInsurancePlans: plansByClinic.get(clinic.id) ?? [],
  }));
}

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

router.get("/clinics/boroughs", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ borough: clinicsTable.borough, neighborhood: clinicsTable.neighborhood })
    .from(clinicsTable);

  const boroughMap = new Map<string, Set<string>>();
  for (const row of rows) {
    const set = boroughMap.get(row.borough) ?? new Set<string>();
    set.add(row.neighborhood);
    boroughMap.set(row.borough, set);
  }

  const boroughOrder = ["Manhattan", "Brooklyn", "Queens"];
  const groups = Array.from(boroughMap.entries())
    .map(([borough, neighborhoods]) => ({
      borough,
      neighborhoods: Array.from(neighborhoods).sort(),
      clinicCount: rows.filter((r) => r.borough === borough).length,
    }))
    .sort((a, b) => {
      const ai = boroughOrder.indexOf(a.borough);
      const bi = boroughOrder.indexOf(b.borough);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  res.json(ListBoroughsResponse.parse(groups));
});

router.get("/clinics", async (req, res): Promise<void> => {
  const query = ListClinicsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { specialty, borough, neighborhood, acceptsNyuInsurance, search } = query.data;

  const conditions = [];
  if (specialty) {
    conditions.push(eq(clinicsTable.specialty, specialty));
  }
  if (borough) {
    conditions.push(eq(clinicsTable.borough, borough));
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

  const withPlans = await attachInsurancePlans(clinics);

  res.json(ListClinicsResponse.parse(withPlans));
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

  const [withPlans] = await attachInsurancePlans([clinic]);

  res.json(GetClinicResponse.parse(withPlans));
});

export default router;
