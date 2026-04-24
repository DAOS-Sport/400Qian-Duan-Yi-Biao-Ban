# 班表系統完整架構與功能邏輯總整理

最後整理時間：2026-04-22  
整理方式：直接依目前程式碼、設定檔、既有文件與實際路由做交叉比對  
用途：給後續大改版、重構、拆模組、補 API、補資料表、補權限時當總藍圖

---

## 1. 系統定位

這個 repo 不是單純的「班表頁面」，而是已經演變成一個混合型後台：

1. 管理端 Dashboard
   提供 LINE Bot 營運監控、公告審核、異常打卡管理、系統健康檢查。

2. 員工 Portal
   提供館別首頁、公告閱讀、交接事項、班表入口、主管管理與使用分析。

3. 本地資料中心
   把異常打卡、通知收件者、Portal 交接、常用網址、系統公告、事件紀錄存在本地 PostgreSQL。

4. 外部服務聚合層
   一部分資料直接由前端打外部 API，一部分資料先打本地 Express，再由後端 proxy 到外部系統。

這代表它本質上是「前台 + 後台 + 整合層 + 小型資料服務」混在同一個 repo 裡。

---

## 2. 一眼看懂目前架構

```text
Browser
├─ 管理端 React 頁面
│  ├─ 有些直接打 LINE Bot 外部 API
│  └─ 有些打本地 Express API
├─ Portal React 頁面
│  ├─ 打本地 Express API
│  ├─ 再由 Express 打 LINE Bot / Smart Schedule / Ragic
│  └─ 或直接讀本地 PostgreSQL
└─ localStorage
   ├─ theme
   ├─ facilityKey
   └─ portalAuth

Express Server
├─ 本地業務路由
│  ├─ anomaly reports
│  ├─ notification recipients
│  ├─ portal handovers
│  ├─ quick links
│  ├─ system announcements
│  └─ portal events analytics
├─ 外部 proxy 路由
│  ├─ LINE Bot assistant
│  ├─ Smart Schedule Manager
│  └─ facility-home APIs
├─ Ragic 員工驗證
├─ Gmail 通知
└─ uploads / exports 靜態檔案

PostgreSQL (Drizzle)
├─ users
├─ anomaly_reports
├─ notification_recipients
├─ handover_entries
├─ quick_links
├─ system_announcements
└─ portal_events
```

---

## 3. 技術堆疊

### 前端

- React 18
- TypeScript
- Vite 7
- Wouter 路由
- TanStack Query
- Tailwind CSS
- shadcn/ui + Radix UI
- Framer Motion
- Recharts

### 後端

- Express 5
- Node HTTP server
- Drizzle ORM
- Neon Serverless PostgreSQL driver
- Multer 上傳
- Nodemailer

### 外部系統

- LINE Bot Assistant
- Smart Schedule Manager
- Ragic
- Gmail SMTP

### 建置

- 開發：`tsx server/index.ts`
- 前端 build：Vite
- 後端 build：esbuild 打成 `dist/index.cjs`
- 正式環境：同一個 Express 同時提供 API + SPA

---

## 4. 目錄與責任分工

### 核心目錄

- `client/`
  前端 React 程式。

- `server/`
  Express 路由、本地業務邏輯、proxy、上傳、寄信、Vite 整合。

- `shared/`
  Drizzle schema 與 zod insert schema，共用型別邊界。

- `script/`
  正式 build 腳本。

- `docs/`
  舊版設計文件與功能說明，內容有參考價值，但已不是完整現況。

- `exports/`
  匯出的公告候選 JSON 與架構文件。

- `uploads/`
  打卡異常附圖。

### 重要單檔

- `client/src/App.tsx`
  全系統前端入口。決定是走管理端 layout 還是 Portal layout。

- `server/index.ts`
  後端總入口。建立 Express、註冊 API、dev/prod server、統一 port。

- `server/routes.ts`
  所有 API 都在這支，包含本地 CRUD、proxy、Ragic、Gmail、Portal。

- `server/storage.ts`
  本地資料庫存取層。

- `shared/schema.ts`
  所有本地資料表定義。

---

## 5. 前端總覽

目前前端其實分成兩個應用模式。

### A. 管理端 App

使用左側 Sidebar + 右側內容區。

#### 管理端路由

| 路由 | 頁面檔案 | 主要用途 | 資料來源 |
|---|---|---|---|
| `/` | `client/src/pages/dashboard.tsx` | LINE Bot 系統總覽、場館功能矩陣、全域服務摘要、異常摘要 | 多數直接打 `line-bot-assistant` 外部 API，異常摘要打本地 `/api/anomaly-reports` |
| `/analytics` | `client/src/pages/analytics.tsx` | 任務統計、群組排行、歷史 | 直接打外部任務 API |
| `/operations` | `client/src/pages/operations.tsx` | 場館自動化/資源監控 | 直接打外部 `venue-automations` |
| `/hr-audit` | `client/src/pages/hr-audit.tsx` | HR 稽核入口 | 本地 `/api/hr-audit`，目前固定 503 |
| `/system-health` | `client/src/pages/system-health.tsx` | 健康檢查與 API latency | 同時測本地 API 與外部 API |
| `/anomaly-reports` | `client/src/pages/anomaly-reports.tsx` | 打卡異常管理、批次處理、通知收件者設定 | 本地 anomaly/notification/test-email API |
| `/announcements` | `client/src/pages/announcements.tsx` | 公告候選列表、審核、退回 | 本地 proxy announcement API |
| `/announcements/summary` | `client/src/pages/announcement-summary.tsx` | 公告摘要統計 | 本地 proxy summary/weekly API |

#### 管理端特性

- 不是所有管理頁都走本地後端。
- Dashboard、Analytics、Operations 有不少資料是前端直接打外部 `https://line-bot-assistant-ronchen2.replit.app`。
- Announcement 與 Anomaly 模組則是走本地 Express。
- 管理端並沒有正式登入與 session 流程。

### B. 員工 Portal App

走獨立的 top bar + side nav + mobile bottom nav，完全不共用管理端 Sidebar。

#### Portal 路由

| 路由 | 頁面檔案 | 主要用途 |
|---|---|---|
| `/portal/login` | `client/src/pages/portal/portal-login.tsx` | 員工編號 + 手機號登入，並選館 |
| `/portal` | `PortalIndexPage` in `App.tsx` | 依 localStorage 判斷跳轉到 login、setup 或場館首頁 |
| `/portal/:facilityKey` | `portal-home.tsx` | Portal 首頁 |
| `/portal/:facilityKey/announcements` | `portal-announcements.tsx` | 館別公告列表 |
| `/portal/:facilityKey/announcements/:id` | `portal-announcement-detail.tsx` | 公告詳情與已讀 |
| `/portal/:facilityKey/handover` | `portal-handover.tsx` | 交接事項列表與新增 |
| `/portal/:facilityKey/campaigns` | `portal-campaigns.tsx` | 活動/折扣列表 |
| `/portal/:facilityKey/shift` | `portal-shift.tsx` | 今日值班入口 |
| `/portal/:facilityKey/manage` | `portal-manage.tsx` | 主管維護 quick links / system announcements |
| `/portal/:facilityKey/analytics` | `portal-analytics.tsx` | 主管看點擊熱力與事件統計 |
| `/portal/:facilityKey/review` | `portal-review.tsx` | 主管在 Portal 裡包一層公告審核頁 |

#### Portal 共用骨架

- `client/src/components/portal/PortalShell.tsx`
  Portal 的真骨架，控制：
  - top bar
  - desktop side nav
  - mobile drawer
  - mobile bottom nav
  - 搜尋欄
  - pageview tracking
  - supervisor-only menu 顯示
  - logout

#### Portal 設定與狀態

- `client/src/config/facility-configs.ts`
  目前硬編 4 個館別：
  - `xinbei_pool`
  - `salu_counter`
  - `songshan_pool`
  - `sanmin_pool`

- `client/src/hooks/use-bound-facility.ts`
  localStorage 管兩組狀態：
  - `facilityKey`
  - `portalAuth`

這表示 Portal 前端登入狀態目前是「純前端 localStorage」，不是 server session。

---

## 6. Portal 首頁邏輯

`client/src/pages/portal/portal-home.tsx`

Portal 首頁由以下資料拼起來：

1. `usePortalHome(groupId, facilityName)`
   來源為 `client/src/lib/portalApi.ts`

2. `useTodayShift(groupId)`

3. `useQuickLinks(facilityKey)`
   本地 DB

4. `useSystemAnnouncements(facilityKey)`
   本地 DB

### 首頁 UI 區塊

- 櫃台交接摘要
- 必讀事項
- 常用網址
- 值班 / 打卡入口
- 公司重要公告 / 聯絡窗口
- 活動檔期 hero
- 系統公告

### 首頁的重要現況

Portal 首頁不是完全吃本地資料。

- 公告/活動/必讀/今日班表，多半靠 `facility-home` proxy 或 announcement fallback
- 常用網址與系統公告，吃本地 PostgreSQL
- 聯絡窗口，吃 `facility-configs.ts` 的靜態設定

### 首頁 fallback 邏輯

`client/src/lib/portalApi.ts` 的 `fetchPortalHome()` 先打：

- `/api/facility-home/:groupId/home`

如果拿不到資料，就 fallback 成：

- 由 `/api/announcement-candidates` 反推 mustRead / announcements / campaigns
- handover 直接給空陣列
- shift 直接給空陣列

這很重要，因為代表：

> Portal 首頁可以在外部 facility-home API 不完整時勉強運作，但只剩公告類資料。

---

## 7. 後端總覽

### 後端入口

`server/index.ts`

負責：

- 建立 Express app 與 HTTP server
- 啟用 JSON/body parsing
- 保存 `rawBody`
- 記錄 `/api` response log
- 註冊 `registerRoutes()`
- dev 環境接 Vite middleware
- prod 環境 serve build static
- 單 port 提供前後端

### dev / prod 模式

#### 開發模式

- `server/vite.ts` 啟用 middleware mode
- 同一個 Express 上掛 Vite HMR
- HTML 從 `client/index.html` 現讀現轉

#### 正式模式

- `server/static.ts`
- 讀 `dist/public`
- 額外把 `/uploads` 暴露成靜態檔
- 所有非 API path 都 fallback 到 `index.html`

---

## 8. 本地資料庫模型

目前 `shared/schema.ts` 一共定義 7 張表。

| 資料表 | 用途 | 目前使用狀態 |
|---|---|---|
| `users` | 使用者帳密 | 幾乎未接到實際路由，偏 legacy |
| `anomaly_reports` | 打卡異常報告 | 主要使用中 |
| `notification_recipients` | 異常通知收件者 | 使用中 |
| `handover_entries` | Portal 交接事項 | 使用中 |
| `quick_links` | Portal 常用網址 | 使用中 |
| `system_announcements` | Portal 系統公告 | 使用中 |
| `portal_events` | Portal 行為追蹤 | 使用中 |

### 特別注意

- repo 裡沒有 `migrations/` 目錄。
- `drizzle.config.ts` 雖然指向 `./migrations`，但目前是 schema-first 狀態。
- 改 schema 前要先決定後續 migration 策略，不然容易出現資料庫與程式不同步。

---

## 9. 本地持久化與檔案輸出

### PostgreSQL

用於：

- 異常打卡
- 通知收件者
- Portal 交接
- Quick links
- System announcements
- Portal analytics

### 檔案系統

- `uploads/anomaly-reports/`
  打卡異常圖片上傳目錄

- `exports/announcement-candidates-export.json`
  公告候選全量匯出

### localStorage

- `theme`
- `facilityKey`
- `portalAuth`

---

## 10. 外部依賴關係

### LINE Bot Assistant

Base URL：
`https://line-bot-assistant-ronchen2.replit.app`

用途：

- 管理端 dashboard/analytics/operations 主要資料來源
- 公告候選與公告摘要
- facility-home 資料
- 公告已讀回報

### Smart Schedule Manager

Base URL：
`https://smart-schedule-manager.replit.app`

用途：

- 異常打卡外部報告合併來源
- admin overview / interview users proxy
- Portal shift 外部入口

### Ragic

用途：

- 員工登入驗證
- 主管身分判斷

### Gmail

用途：

- 異常打卡新報告通知
- 處理狀態通知
- 批次處理通知
- 測試郵件

---

## 11. API 版圖

### A. 本地資料 API

#### 異常打卡

- `POST /api/anomaly-report`
- `GET /api/anomaly-reports`
- `GET /api/anomaly-reports/:id`
- `PATCH /api/anomaly-reports/:id/resolution`
- `PATCH /api/anomaly-reports/batch/resolution`
- `DELETE /api/anomaly-reports/:id`

#### 通知收件者

- `GET /api/notification-recipients`
- `POST /api/notification-recipients`
- `PATCH /api/notification-recipients/:id`
- `DELETE /api/notification-recipients/:id`

#### Portal 本地資料

- `GET /api/portal/handovers`
- `POST /api/portal/handovers`
- `DELETE /api/portal/handovers/:id`
- `GET /api/portal/quick-links`
- `POST /api/portal/quick-links`
- `PATCH /api/portal/quick-links/:id`
- `DELETE /api/portal/quick-links/:id`
- `GET /api/portal/system-announcements`
- `POST /api/portal/system-announcements`
- `PATCH /api/portal/system-announcements/:id`
- `DELETE /api/portal/system-announcements/:id`
- `POST /api/portal/events`
- `GET /api/portal/analytics`

### B. 驗證與工具 API

- `POST /api/auth/ragic-login`
- `POST /api/test-email`
- `POST /api/hr-audit`  
  目前只是 placeholder，固定回 503

### C. Proxy API

#### 公告模組

- `GET /api/announcement-dashboard/summary`
- `GET /api/announcement-candidates`
- `GET /api/announcement-candidates/:id`
- `POST /api/announcement-candidates/:id/approve`
- `POST /api/announcement-candidates/:id/reject`
- `GET /api/announcement-reports/weekly`

#### Facility Home

- `GET /api/facility-home/:groupId/home`
- `GET /api/facility-home/:groupId/announcements`
- `GET /api/facility-home/:groupId/announcements/:id`
- `GET /api/facility-home/:groupId/today-shift`
- `GET /api/facility-home/:groupId/handover`
- `POST /api/facility-home/:groupId/announcements/:id/ack`

#### 排班系統

- `GET /api/admin/overview`
- `GET /api/admin/interview-users`

#### 匯出

- `GET /api/announcement-candidates/export/all`
- `GET /exports/:filename`

---

## 12. 五條關鍵業務流

### Flow 1：打卡異常上報

1. 外部系統呼叫 `POST /api/anomaly-report`
2. Express 接圖片與 JSON/multipart payload
3. 整理成 `anomaly_reports` row
4. 寫入 PostgreSQL
5. 視情況寄 Gmail 通知
6. 前端 `/anomaly-reports` 可查詢與處理
7. 同時合併 Smart Schedule 外部異常資料一起顯示

### Flow 2：員工 Portal 登入

1. Portal login 頁輸入員工編號與手機
2. 前端呼叫 `POST /api/auth/ragic-login`
3. 後端去 Ragic 查員工資料
4. 驗證手機是否一致
5. 判斷是否在職、是否主管
6. 成功後前端把 auth state 存進 localStorage
7. 跳到指定館別 Portal

### Flow 3：Portal 首頁資料組裝

1. 前端依 `facilityKey` 找到 `facilityLineGroupId` 與 `facilityName`
2. 呼叫 `usePortalHome(groupId, facilityName)`
3. 優先吃 `/api/facility-home/:groupId/home`
4. 若上游無資料，fallback 用公告候選資料組裝 mustRead / announcements / campaigns
5. 再額外讀本地 quick links 與 system announcements
6. 最後由 PortalShell 套上共用 layout

### Flow 4：交接事項管理

1. `/portal/:facilityKey/handover` 讀本地 `/api/portal/handovers`
2. 新增交接時送到 `POST /api/portal/handovers`
3. 後端理論上要以 caller 身分強制覆蓋 author 欄位
4. 建立成功後同步寫一筆 `portal_events`

### Flow 5：公告審核與員工閱讀

1. 管理端 `/announcements` 透過本地 proxy 讀上游候選
2. 審核 approve/reject 也是由本地 proxy 轉發
3. Portal 讀取已核准公告作為 mustRead / announcements / campaigns
4. 員工開啟公告詳情後可 `ack`
5. `ack` 會打回 facility-home 上游 API

---

## 13. 目前程式耦合與風險點

這段最重要，因為你接下來要動刀。

### 1. 管理端資料來源分裂

目前管理端有兩種取數模式並存：

- 前端直接打外部 API
- 前端先打本地 Express，再由後端 proxy

這會導致：

- 環境切換時 base URL 管理混亂
- 權限與錯誤處理不一致
- 本地測試與正式環境行為不一致

### 2. Portal 寫入權限有明顯斷層

`server/routes.ts` 的 Portal 寫入路由依賴：

- `x-employee-number` header

但目前前端：

- `useCreateHandover()`
- `useUpsertQuickLink()`
- `useDeleteQuickLink()`
- `useUpsertSystemAnnouncement()`
- `useDeleteSystemAnnouncement()`

這些 mutation 都只用 `apiRequest()`，沒有把 `x-employee-number` 送上去。

也就是說：

> 目前交接新增/刪除、quick links 管理、system announcements 管理，在現況下大機率會被 server 視為未授權。

只有 `trackPortalEvent()` 有手動帶 `X-Employee-Number` / `X-Employee-Name` / `X-Facility-Key`。

### 3. Portal 首頁的交接摘要與本地交接表脫鉤

首頁 `portal-home.tsx` 顯示的 handover 來自：

- `usePortalHome()`
- `facility-home` 上游或 fallback

但交接頁 `/portal/:facilityKey/handover` 寫入的是：

- 本地 `handover_entries`

所以現況是：

> 你在交接頁新增的本地交接，不會自然出現在 Portal 首頁 handover 區塊。

### 4. `users` 表與 auth 依賴像是遺留物

repo 有：

- `users` table
- `createUser/getUser/getUserByUsername`
- `passport`
- `passport-local`
- `express-session`

但目前主要功能並沒有真正走這套帳密系統。

實際上在跑的是：

- Portal localStorage auth
- server 端 Ragic lookup

代表現況存在一層 legacy auth 殘留。

### 5. 沒有 migration 與 test

目前：

- 無 migration 目錄
- `package.json` 沒有 test script

這代表任何大改：

- schema 變更容易失控
- refactor 沒有自動回歸保護

---

## 14. 修改切入點指南

### 如果你要改 Portal UI/首頁結構

先看：

- `client/src/pages/portal/portal-home.tsx`
- `client/src/components/portal/PortalShell.tsx`
- `client/src/components/portal/AnnouncementDrawer.tsx`
- `client/src/components/portal/*.tsx`
- `client/src/config/facility-configs.ts`

### 如果你要改 Portal 登入/權限

先看：

- `client/src/pages/portal/portal-login.tsx`
- `client/src/hooks/use-bound-facility.ts`
- `server/routes.ts` 的：
  - `lookupEmployee()`
  - `resolveCaller()`
  - `requireEmployee()`
  - `requireSupervisor()`
  - `/api/auth/ragic-login`

### 如果你要改交接、常用網址、系統公告

先看：

- `shared/schema.ts`
- `server/storage.ts`
- `server/routes.ts`
- `client/src/hooks/usePortalData.ts`
- `client/src/pages/portal/portal-handover.tsx`
- `client/src/pages/portal/portal-manage.tsx`

### 如果你要改異常打卡模組

先看：

- `server/routes.ts` anomaly 區塊
- `server/storage.ts`
- `shared/schema.ts` 的 `anomaly_reports`
- `client/src/pages/anomaly-reports.tsx`

### 如果你要改公告審核 / 員工公告

先看：

- `client/src/pages/announcements.tsx`
- `client/src/pages/announcement-summary.tsx`
- `client/src/pages/portal/portal-announcements.tsx`
- `client/src/pages/portal/portal-announcement-detail.tsx`
- `client/src/lib/portalApi.ts`
- `server/routes.ts` announcement proxy 區塊

### 如果你要改資料來源整合方式

先看：

- `client/src/pages/dashboard.tsx`
- `client/src/pages/analytics.tsx`
- `client/src/pages/operations.tsx`
- `client/src/pages/system-health.tsx`
- `server/routes.ts` proxy 區塊

---

## 15. 建議的重構優先順序

如果你準備大修，建議順序如下。

### 第一層：先救結構

1. 把 Portal 寫入 API 的認證方式統一
2. 決定管理端所有資料要不要全部改走本地 proxy
3. 把 Portal 首頁 handover 改成吃本地交接資料

### 第二層：再救資料一致性

4. 建立 migration 流程
5. 補 schema 版本管理
6. 明確切分本地資料與上游資料責任

### 第三層：最後才做美化或擴功能

7. Portal UI 優化
8. 新館別配置
9. HR audit 真 API 接入
10. 補測試

---

## 16. 結論

目前這套系統的真實狀態不是單純的班表系統，而是：

- 管理端營運後台
- 員工館別 Portal
- 本地資料庫服務
- 外部 LINE / 排班 / Ragic 聚合層

最適合動刀的方式，不是直接從 UI 開砍，而是先釐清三件事：

1. 哪些資料應該由本地系統擁有
2. 哪些資料應該只 proxy 外部
3. Portal 權限到底要 localStorage、header、session 還是正式 token

這三件先定，後面的改版才不會越改越亂。
