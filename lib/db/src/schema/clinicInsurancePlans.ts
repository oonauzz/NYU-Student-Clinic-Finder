import { pgTable, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";
import { insurancePlansTable } from "./insurancePlans";

export const clinicInsurancePlansTable = pgTable("clinic_insurance_plans", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  insurancePlanId: integer("insurance_plan_id")
    .notNull()
    .references(() => insurancePlansTable.id, { onDelete: "cascade" }),
});

export const insertClinicInsurancePlanSchema = createInsertSchema(clinicInsurancePlansTable).omit({
  id: true,
});
export type InsertClinicInsurancePlan = z.infer<typeof insertClinicInsurancePlanSchema>;
export type ClinicInsurancePlan = typeof clinicInsurancePlansTable.$inferSelect;
