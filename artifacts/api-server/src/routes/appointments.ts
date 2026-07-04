import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, doctorsTable, appointmentsTable, clinicsTable } from "@workspace/db";
import {
  BookAppointmentParams,
  BookAppointmentBody,
  BookAppointmentResponse,
  ListAppointmentsByEmailQueryParams,
  ListAppointmentsByEmailResponseItem,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/appointments", async (req, res): Promise<void> => {
  const query = ListAppointmentsByEmailQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
    .select({
      id: appointmentsTable.id,
      clinicId: appointmentsTable.clinicId,
      clinicName: clinicsTable.name,
      clinicNeighborhood: clinicsTable.neighborhood,
      doctorId: appointmentsTable.doctorId,
      doctorName: doctorsTable.name,
      patientName: appointmentsTable.patientName,
      patientEmail: appointmentsTable.patientEmail,
      patientPhone: appointmentsTable.patientPhone,
      notes: appointmentsTable.notes,
      appointmentAt: appointmentsTable.appointmentAt,
      status: appointmentsTable.status,
      createdAt: appointmentsTable.createdAt,
    })
    .from(appointmentsTable)
    .innerJoin(clinicsTable, eq(appointmentsTable.clinicId, clinicsTable.id))
    .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
    .where(eq(appointmentsTable.patientEmail, query.data.email))
    .orderBy(desc(appointmentsTable.appointmentAt));

  res.json(rows.map((row) => ListAppointmentsByEmailResponseItem.parse(row)));
});

router.post("/clinics/:id/doctors/:doctorId/appointments", async (req, res): Promise<void> => {
  const params = BookAppointmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = BookAppointmentBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [doctor] = await db
    .select()
    .from(doctorsTable)
    .where(eq(doctorsTable.id, params.data.doctorId));

  if (!doctor || doctor.clinicId !== params.data.id) {
    res.status(404).json({ error: "Doctor not found at this clinic" });
    return;
  }

  const bookedAt = doctor.nextAvailableAt;
  const nextSlot = new Date(bookedAt.getTime() + (24 + Math.random() * 72) * 60 * 60 * 1000);

  const [appointment] = await db
    .insert(appointmentsTable)
    .values({
      clinicId: params.data.id,
      doctorId: doctor.id,
      patientName: body.data.patientName,
      patientEmail: body.data.patientEmail,
      patientPhone: body.data.patientPhone ?? null,
      notes: body.data.notes ?? null,
      appointmentAt: bookedAt,
      status: "confirmed",
    })
    .returning();

  await db.update(doctorsTable).set({ nextAvailableAt: nextSlot }).where(eq(doctorsTable.id, doctor.id));

  res.status(201).json(
    BookAppointmentResponse.parse({
      ...appointment,
      doctorName: doctor.name,
    }),
  );
});

export default router;
