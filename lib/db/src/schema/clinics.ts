import { pgTable, serial, text, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const clinicsTable = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  borough: text("borough").notNull().default("Manhattan"),
  neighborhood: text("neighborhood").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  averageWaitDays: real("average_wait_days").notNull(),
  acceptsNyuInsurance: boolean("accepts_nyu_insurance").notNull().default(false),
  rating: real("rating").notNull(),
  distanceFromCampusMiles: real("distance_from_campus_miles").notNull(),
  hours: text("hours").notNull(),
  notes: text("notes").notNull(),
  walkInAvailable: boolean("walk_in_available").notNull().default(false),
  isNyuHealthCenter: boolean("is_nyu_health_center").notNull().default(false),
});

export const insertClinicSchema = createInsertSchema(clinicsTable).omit({ id: true });
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type Clinic = typeof clinicsTable.$inferSelect;
