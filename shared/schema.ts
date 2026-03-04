import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const anomalyReports = pgTable("anomaly_reports", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id"),
  employeeName: text("employee_name"),
  employeeCode: text("employee_code"),
  role: text("role"),
  lineUserId: text("line_user_id"),
  context: text("context").notNull(),
  clockStatus: text("clock_status"),
  clockType: text("clock_type"),
  clockTime: text("clock_time"),
  venueName: text("venue_name"),
  distance: text("distance"),
  failReason: text("fail_reason"),
  errorMsg: text("error_msg"),
  userNote: text("user_note"),
  imageUrls: text("image_urls").array(),
  reportText: text("report_text"),
  resolution: text("resolution").default("pending"),
  resolvedNote: text("resolved_note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnomalyReportSchema = createInsertSchema(anomalyReports).omit({
  id: true,
  createdAt: true,
});

export type InsertAnomalyReport = z.infer<typeof insertAnomalyReportSchema>;
export type AnomalyReport = typeof anomalyReports.$inferSelect;
