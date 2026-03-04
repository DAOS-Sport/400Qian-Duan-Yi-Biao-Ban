import { type User, type InsertUser, type AnomalyReport, type InsertAnomalyReport, users, anomalyReports } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createAnomalyReport(report: InsertAnomalyReport): Promise<AnomalyReport>;
  getAllAnomalyReports(): Promise<AnomalyReport[]>;
  getAnomalyReportById(id: number): Promise<AnomalyReport | undefined>;
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
}

export const storage = new DatabaseStorage();
