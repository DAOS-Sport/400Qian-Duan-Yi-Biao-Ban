import { type User, type InsertUser, type AnomalyReport, type InsertAnomalyReport, type NotificationRecipient, type InsertNotificationRecipient, users, anomalyReports, notificationRecipients } from "@shared/schema";
import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnomalyReport(report: InsertAnomalyReport): Promise<AnomalyReport>;
  getAllAnomalyReports(): Promise<AnomalyReport[]>;
  getAnomalyReportById(id: number): Promise<AnomalyReport | undefined>;
  updateAnomalyReportResolution(id: number, resolution: string, resolvedNote: string | null): Promise<AnomalyReport | undefined>;
  batchUpdateResolution(ids: number[], resolution: string, resolvedNote: string | null): Promise<number>;
  deleteAnomalyReport(id: number): Promise<boolean>;
  getAllRecipients(): Promise<NotificationRecipient[]>;
  createRecipient(recipient: InsertNotificationRecipient): Promise<NotificationRecipient>;
  updateRecipient(id: number, data: Partial<InsertNotificationRecipient>): Promise<NotificationRecipient | undefined>;
  deleteRecipient(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({ ...insertUser, id: randomUUID() }).returning();
    return user;
  }

  async createAnomalyReport(report: InsertAnomalyReport): Promise<AnomalyReport> {
    const [created] = await db.insert(anomalyReports).values(report).returning();
    return created;
  }

  async getAllAnomalyReports(): Promise<AnomalyReport[]> {
    return db.select().from(anomalyReports).orderBy(desc(anomalyReports.createdAt));
  }

  async getAnomalyReportById(id: number): Promise<AnomalyReport | undefined> {
    const [report] = await db.select().from(anomalyReports).where(eq(anomalyReports.id, id));
    return report;
  }

  async updateAnomalyReportResolution(id: number, resolution: string, resolvedNote: string | null): Promise<AnomalyReport | undefined> {
    const [updated] = await db
      .update(anomalyReports)
      .set({ resolution, resolvedNote })
      .where(eq(anomalyReports.id, id))
      .returning();
    return updated;
  }

  async batchUpdateResolution(ids: number[], resolution: string, resolvedNote: string | null): Promise<number> {
    const result = await db
      .update(anomalyReports)
      .set({ resolution, resolvedNote })
      .where(inArray(anomalyReports.id, ids))
      .returning();
    return result.length;
  }

  async deleteAnomalyReport(id: number): Promise<boolean> {
    const result = await db.delete(anomalyReports).where(eq(anomalyReports.id, id)).returning();
    return result.length > 0;
  }

  async getAllRecipients(): Promise<NotificationRecipient[]> {
    return db.select().from(notificationRecipients).orderBy(desc(notificationRecipients.createdAt));
  }

  async createRecipient(recipient: InsertNotificationRecipient): Promise<NotificationRecipient> {
    const [created] = await db.insert(notificationRecipients).values(recipient).returning();
    return created;
  }

  async updateRecipient(id: number, data: Partial<InsertNotificationRecipient>): Promise<NotificationRecipient | undefined> {
    const [updated] = await db.update(notificationRecipients).set(data).where(eq(notificationRecipients.id, id)).returning();
    return updated;
  }

  async deleteRecipient(id: number): Promise<boolean> {
    const result = await db.delete(notificationRecipients).where(eq(notificationRecipients.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
