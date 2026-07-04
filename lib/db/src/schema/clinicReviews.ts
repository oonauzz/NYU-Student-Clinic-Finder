import { pgTable, serial, text, real, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { clinicsTable } from "./clinics";

export const clinicReviewsTable = pgTable("clinic_reviews", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  reportedWaitDays: real("reported_wait_days"),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClinicReviewSchema = createInsertSchema(clinicReviewsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertClinicReview = z.infer<typeof insertClinicReviewSchema>;
export type ClinicReview = typeof clinicReviewsTable.$inferSelect;
