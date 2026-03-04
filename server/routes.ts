import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "anomaly-reports");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `anomaly-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error("僅允許上傳圖片檔案 (jpg, png, gif, webp, heic)"));
    }
    cb(null, true);
  },
});

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function formatReportText(data: any): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const timeStr = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  let text = `!!!打卡異常報告!!!\n報告時間：${timeStr}\n`;
  text += `異常類型：${data.context || "未指定"}\n`;

  if (data.employee) {
    text += `\n【員工資訊】\n`;
    text += `姓名：${data.employee.name || "未知"}\n`;
    text += `員工編號：${data.employee.employeeCode || "未知"}\n`;
    text += `職位：${data.employee.role || "未知"}\n`;
  }

  if (data.clockResult) {
    text += `\n【打卡紀錄】\n`;
    text += `狀態：${data.clockResult.status || "未知"}\n`;
    text += `類型：${data.clockResult.clockType === "in" ? "上班打卡" : data.clockResult.clockType === "out" ? "下班打卡" : data.clockResult.clockType || "未知"}\n`;
    text += `日期：${data.clockResult.date || "未知"}\n`;
    text += `時間：${data.clockResult.time || "未知"}\n`;
    text += `場館：${data.clockResult.venueName || "未知"}\n`;
    text += `距離：${data.clockResult.distance ?? "未知"}m\n`;
    text += `允許半徑：${data.clockResult.radius ?? "未知"}m\n`;
    text += `失敗原因：${data.clockResult.failReason || "無"}\n`;
  }

  if (data.errorMsg) {
    text += `\n錯誤訊息：${data.errorMsg}\n`;
  }

  if (data.userNote) {
    text += `\n用戶備註：${data.userNote}\n`;
  }

  return text;
}

async function sendAnomalyEmail(reportText: string, data: any) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("[Gmail] 未設定 GMAIL 帳號密碼，跳過寄信");
    return;
  }

  const employeeName = data.employee?.name || "未知員工";
  const venueName = data.clockResult?.venueName || "未知場館";
  const subject = `🚨 打卡異常報告 — ${employeeName}（${venueName}）`;

  try {
    await transporter.sendMail({
      from: `"DAOS 異常監控系統" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER!,
      subject,
      text: reportText,
    });
    console.log("[Gmail] 異常報告郵件已發送");
  } catch (err: any) {
    console.error("[Gmail] 寄信失敗:", err.message);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/uploads", (await import("express")).default.static(path.join(process.cwd(), "uploads")));

  app.post("/api/anomaly-report", upload.array("images", 5), async (req, res) => {
    try {
      let data: any;
      if (req.is("multipart/form-data")) {
        const raw = req.body?.data;
        data = raw ? JSON.parse(raw) : {};
      } else {
        data = req.body || {};
      }

      if (!data.context) {
        return res.status(400).json({ message: "缺少必填欄位: context" });
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const imageUrls = files.map((f) => `/uploads/anomaly-reports/${f.filename}`);

      const reportText = formatReportText(data);

      const clockResult = data.clockResult || {};
      const employee = data.employee || {};

      const report = await storage.createAnomalyReport({
        employeeId: employee.id ?? null,
        employeeName: employee.name ?? null,
        employeeCode: employee.employeeCode ?? null,
        role: employee.role ?? null,
        lineUserId: employee.lineUserId ?? null,
        context: data.context,
        clockStatus: clockResult.status ?? null,
        clockType: clockResult.clockType ?? null,
        clockTime: clockResult.date && clockResult.time ? `${clockResult.date} ${clockResult.time}` : null,
        venueName: clockResult.venueName ?? null,
        distance: clockResult.distance != null ? `${clockResult.distance}m` : null,
        failReason: clockResult.failReason ?? null,
        errorMsg: data.errorMsg ?? null,
        userNote: data.userNote ?? null,
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        reportText,
      });

      sendAnomalyEmail(reportText, data).catch(() => {});

      res.status(200).json({
        id: report.id,
        reportText: report.reportText,
        createdAt: report.createdAt,
        imageUrls: report.imageUrls || [],
        lineUrl: "https://lin.ee/TupPc0V",
      });
    } catch (err: any) {
      console.error("[anomaly-report] Error:", err);
      res.status(500).json({ message: err.message || "伺服器內部錯誤" });
    }
  });

  app.get("/api/anomaly-reports", async (_req, res) => {
    try {
      const reports = await storage.getAllAnomalyReports();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "伺服器內部錯誤" });
    }
  });

  app.get("/api/anomaly-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "無效的 ID" });
      const report = await storage.getAnomalyReportById(id);
      if (!report) return res.status(404).json({ message: "找不到此異常報告" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "伺服器內部錯誤" });
    }
  });

  app.patch("/api/anomaly-reports/:id/resolution", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "無效的 ID" });

      const { resolution, resolvedNote } = req.body || {};
      if (!resolution || !["pending", "resolved"].includes(resolution)) {
        return res.status(400).json({ message: "resolution 必須為 'pending' 或 'resolved'" });
      }

      const updated = await storage.updateAnomalyReportResolution(id, resolution, resolvedNote ?? null);
      if (!updated) return res.status(404).json({ message: "找不到此異常報告" });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message || "伺服器內部錯誤" });
    }
  });

  return httpServer;
}
