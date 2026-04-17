import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
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

export const notificationRecipients = pgTable("notification_recipients", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  label: text("label"),
  enabled: boolean("enabled").default(true).notNull(),
  notifyNewReport: boolean("notify_new_report").default(true).notNull(),
  notifyResolution: boolean("notify_resolution").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationRecipientSchema = createInsertSchema(notificationRecipients).omit({
  id: true,
  createdAt: true,
});

export type InsertNotificationRecipient = z.infer<typeof insertNotificationRecipientSchema>;
export type NotificationRecipient = typeof notificationRecipients.$inferSelect;

export const handoverEntries = pgTable("handover_entries", {
  id: serial("id").primaryKey(),
  facilityKey: text("facility_key").notNull(),
  content: text("content").notNull(),
  authorEmployeeNumber: text("author_employee_number"),
  authorName: text("author_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHandoverEntrySchema = createInsertSchema(handoverEntries).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().min(1, "內容不可為空").max(2000, "內容過長"),
  facilityKey: z.string().min(1),
});

export type InsertHandoverEntry = z.infer<typeof insertHandoverEntrySchema>;
export type HandoverEntry = typeof handoverEntries.$inferSelect;

export const quickLinks = pgTable("quick_links", {
  id: serial("id").primaryKey(),
  facilityKey: text("facility_key"),
  title: text("title").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuickLinkSchema = createInsertSchema(quickLinks).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "標題不可為空"),
  url: z.string().url("網址格式不正確"),
});

export type InsertQuickLink = z.infer<typeof insertQuickLinkSchema>;
export type QuickLink = typeof quickLinks.$inferSelect;

export const systemAnnouncements = pgTable("system_announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  severity: text("severity").default("info").notNull(),
  facilityKey: text("facility_key"),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSystemAnnouncementSchema = createInsertSchema(systemAnnouncements).omit({
  id: true,
  createdAt: true,
}).extend({
  title: z.string().min(1, "標題不可為空"),
  content: z.string().min(1, "內容不可為空"),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
});

export type InsertSystemAnnouncement = z.infer<typeof insertSystemAnnouncementSchema>;
export type SystemAnnouncement = typeof systemAnnouncements.$inferSelect;

export const portalEvents = pgTable("portal_events", {
  id: serial("id").primaryKey(),
  employeeNumber: text("employee_number"),
  employeeName: text("employee_name"),
  facilityKey: text("facility_key"),
  eventType: text("event_type").notNull(),
  target: text("target"),
  targetLabel: text("target_label"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPortalEventSchema = createInsertSchema(portalEvents).omit({
  id: true,
  createdAt: true,
}).extend({
  eventType: z.enum(["pageview", "link_click", "announcement_open", "handover_create"]),
});

export type InsertPortalEvent = z.infer<typeof insertPortalEventSchema>;
export type PortalEvent = typeof portalEvents.$inferSelect;
