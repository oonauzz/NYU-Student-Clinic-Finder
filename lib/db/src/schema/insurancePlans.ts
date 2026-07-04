import { pgTable, serial, text, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const insurancePlansTable = pgTable("insurance_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  annualPremium: real("annual_premium").notNull(),
  waivable: boolean("waivable").notNull().default(true),
  keyBenefits: text("key_benefits").array().notNull(),
});

export const insertInsurancePlanSchema = createInsertSchema(insurancePlansTable).omit({ id: true });
export type InsertInsurancePlan = z.infer<typeof insertInsurancePlanSchema>;
export type InsurancePlan = typeof insurancePlansTable.$inferSelect;
