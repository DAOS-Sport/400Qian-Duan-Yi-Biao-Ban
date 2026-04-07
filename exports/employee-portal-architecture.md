# 員工值班入口 前端架構規劃書
# Employee Shift Portal — Frontend Architecture Plan

**版本**: v1.0 (Draft for Review)
**日期**: 2026-04-07
**狀態**: 待討論修改

---

## 1. 目標定位

### 現有系統 = 管理層/資訊部工作台
目前的 8 頁 Dashboard 是給**主管與資訊部**看的：
- 營運戰情總覽、決策分析、跨館監控、系統健康...
- 公告歸納器（候選審核 + 分析總覽）
- 打卡異常管理、HR 稽核

### 新增系統 = 員工值班工作台
新增的是給**前線員工**（櫃台、救生員、新人、行政支援）看的：
- 上班打開就知道今天要注意什麼
- 不用翻群組、不用到處問
- 以「館別」為單位呈現對應資訊

---

## 2. API 現況盤點

### 可直接使用的 API

| API | 來源 | 狀態 | 用途 |
|---|---|---|---|
| `GET /api/announcement-candidates?status=approved` | LINE Bot | 可用 (目前 0 筆已核准) | 已核准公告 → 員工必看 |
| `GET /api/announcement-candidates?status=pending_review` | LINE Bot | 可用 (27 筆待審) | 管理端用，非員工端 |
| `GET /api/announcement-dashboard/summary` | LINE Bot | 可用 | 公告統計 (byFacility, byGroup) |
| `GET /api/announcement-candidates/:id` | LINE Bot | 可用 | 公告詳情 (含 recommendedReply, badExample) |

### 需要後端新增的 API（目前不存在）

| API | 用途 | 優先級 | 備註 |
|---|---|---|---|
| `GET /api/facility-home/:facilityId` | 館別首頁整合資料 | P1 | 需在 LINE Bot 後端新增 |
| `GET /api/facility-home/:facilityId/announcements` | 該館公告 | P1 | 可用現有 candidates API + facilityName 過濾替代 |
| `GET /api/facility-home/:facilityId/campaigns` | 該館活動/折扣 | P2 | 需新增 |
| `GET /api/facility-home/:facilityId/handover` | 交接事項 | P2 | 需新增 |
| `GET /api/facility-home/:facilityId/courses` | 課程資訊 | P2 | 需新增 |
| `GET /api/facility-home/:facilityId/contact-points` | 聯絡窗口 | P2 | 需新增 |
| `GET /api/me` | 員工身份 | P1 | Smart Schedule 有但需登入 |
| `GET /api/me/today-shift` | 今日班次 | P1 | Smart Schedule 有但需登入 |

### Smart Schedule Manager API（需登入）

| API | 狀態 | 備註 |
|---|---|---|
| `GET /api/me` | 401 需登入 | 已有 LINE Login |
| `GET /api/employees` | 401 需登入 | 已有 |
| `GET /api/facilities` | 401 需登入 | 已有 |
| `GET /api/shifts/today` | 401 需登入 | 已有 |

---

## 3. 第一階段策略（先做前端，逐步接 API）

**核心原則**：先把前端頁面結構建好，用**真 API + 空狀態**呈現，不放假資料。

### 可立即接的真實資料
1. **已核准公告** → `announcement-candidates?status=approved&facilityName=XXX`
2. **各群組公告** → `announcement-candidates?candidateType=rule,notice,script`
3. **場館列表** → 從 `announcement-dashboard/summary` 的 `byFacility` 取得場館清單

### 需要空狀態等 API 的區塊
- 交接事項 → 空狀態：「尚無交接事項」
- 課程/活動 → 空狀態：「課程資訊整合中」
- 聯絡窗口 → 空狀態：「窗口資訊建置中」
- 值班人員 → 空狀態：「排班系統整合中」

---

## 4. 路由規劃

### 新增路由

| 路由 | 頁面 | 說明 |
|---|---|---|
| `/portal` | 員工入口選擇館別 | 選館頁 (或直接進預設館) |
| `/portal/:facilityId` | 值班儀表板首頁 | 該館的員工工作台 |
| `/portal/:facilityId/announcements` | 公告詳情列表 | 查看更多公告 |

### 整體路由架構

```
管理端 (現有 Sidebar 導航)
├── /                    → 營運戰情總覽
├── /analytics           → 決策與數據洞察
├── /operations          → 跨館資源監控
├── /hr-audit            → HR 與權限稽核
├── /system-health       → 微服務健康監控
├── /anomaly-reports     → 打卡異常管理
├── /announcements       → 公告審核中心
└── /announcements/summary → 公告分析總覽

員工端 (新增，獨立佈局，無管理 Sidebar)
├── /portal              → 選擇場館入口
└── /portal/:facilityId  → 值班儀表板
```

### 佈局差異
- **管理端**：左側 Sidebar + 右側內容區（現有）
- **員工端**：全幅佈局，頂部 TopBar + 內容區（新設計，無 Sidebar）

---

## 5. 員工首頁元件架構

### 頁面結構 (FacilityHomePage.tsx)

```
┌─────────────────────────────────────────────────┐
│ TopSearchAndUserBar                              │
│ [搜尋欄]              [館別名稱] [身份/角色狀態] │
├──────────────────────┬──────────────────────┬────┤
│                      │                      │    │
│ MustReadSection      │ GroupAnnouncement     │ C  │
│ 今日必看             │ Section              │ o  │
│ (priority:           │ 群組公告/規範         │ u  │
│  high/critical)      │ (rule, notice,       │ r  │
│                      │  script 類型)         │ s  │
│ 紅色/橘色標籤        │ 來源群組 Tag          │ e  │
│                      │                      │ &  │
│                      │                      │ C  │
├──────────────────────┼──────────────────────┤ a  │
│                      │                      │ m  │
│ ShiftHandover        │ OnDutyStaff          │ p  │
│ Section              │ Section              │ a  │
│ 櫃台交接             │ 值班人員             │ i  │
│                      │ (打卡模組列出         │ g  │
│                      │  誰上班+備註)         │ n  │
│                      │                      │    │
└──────────────────────┴──────────────────────┴────┘
```

### 元件清單

| 元件 | 檔案 | 資料來源 | 第一階段狀態 |
|---|---|---|---|
| TopSearchAndUserBar | `portal/top-bar.tsx` | 館別名稱、使用者 | 館別顯示 + 搜尋框 |
| MustReadSection | `portal/must-read-section.tsx` | approved 公告 (priority: high/critical) | 接真 API |
| GroupAnnouncementSection | `portal/group-announcement-section.tsx` | rule/notice/script 公告 | 接真 API |
| ShiftHandoverSection | `portal/shift-handover-section.tsx` | 交接事項 | 空狀態 |
| OnDutyStaffSection | `portal/on-duty-staff-section.tsx` | 值班人員 | 空狀態 |
| CampaignSection | `portal/campaign-section.tsx` | 活動/折扣/課程 | 空狀態 |
| AnnouncementDetailDrawer | `portal/announcement-detail-drawer.tsx` | 單筆公告詳情 | 接真 API |

---

## 6. 資料型別定義

```typescript
// 員工端公告（從 announcement-candidates 轉換）
interface PortalAnnouncement {
  id: number;
  title: string;
  summary: string;
  candidateType: 'rule' | 'notice' | 'campaign' | 'discount' | 'script';
  priority: 'critical' | 'high' | 'normal' | 'low';    // 需從 confidence + reasoningTags 推導
  scopeType: 'group' | 'facility' | 'multi_facility' | 'global';
  facilityName: string;
  effectiveStartAt: string;    // detectedAt 或 startAt
  effectiveEndAt?: string;     // endAt
  needsAck: boolean;           // 第二階段，先 false
  body?: string;               // originalText
  recommendedAction?: string;
  recommendedReply?: string;
  badExample?: string;
}

// 場館首頁整合資料
interface FacilityHomePayload {
  facility: {
    id: string;        // groupId
    name: string;      // facilityName
  };
  blocks: {
    mustRead: PortalAnnouncement[];        // priority high/critical
    groupAnnouncements: PortalAnnouncement[];  // rule, notice, script
    campaigns: PortalAnnouncement[];       // campaign, discount
    handover: any[];                       // 第二階段
  };
}
```

---

## 7. 場館對照表

從現有 API summary 的 `byFacility` 可取得以下場館：

| 場館名稱 | 公告數量 | 優先服務 |
|---|---|---|
| 新北高中游泳池&運動中心 | 75 | 是 (三蘆區) |
| 駿斯-三蘆區櫃台 | 24 | 是 (三蘆區) |
| 三民高中游泳池 | 17 | 否 |
| 駿斯IT技術群 | 11 | 否 (內部群) |
| 竹科高爾夫/網球&籃球 | 3 | 否 |
| 松山國小室內溫水游泳池 | 1 | 是 (松山區) |
| 三重商工游泳池&籃球場 | 2 | 否 |
| 原授權群組 | 3 | 否 |
| 未知場館 | 73 | - |

**第一階段先服務**：三蘆區（新北高中 + 三蘆櫃台）、松山區（松山國小）

---

## 8. 公告 → 員工端的資料轉換邏輯

員工端不直接顯示 `announcement_candidates` 的原始資料，需轉換：

```
announcement_candidates (API 原始)
│
├─ status === 'approved'  ──→  正式公告，員工可見
├─ candidateType
│  ├─ rule / notice / script  ──→  群組公告/規範 區塊
│  ├─ campaign / discount     ──→  活動與折扣 區塊
│  └─ ignore                  ──→  不顯示
│
├─ priority 推導規則：
│  ├─ confidence >= 0.9 且 candidateType === 'rule'  ──→  critical
│  ├─ confidence >= 0.8                                ──→  high
│  ├─ confidence >= 0.5                                ──→  normal
│  └─ else                                             ──→  low
│
└─ facilityName 過濾：只顯示該館 + global scope 的公告
```

---

## 9. UI/UX 設計原則

1. **Vercel 設計系統延續**：Geist 字體、shadow-as-border、achromatic palette
2. **無 Sidebar**：員工端用全幅佈局，頂部導航
3. **卡片點擊 = Drawer/Sheet 滑出**：不跳轉頁面，用 shadcn Sheet 從右側滑出顯示詳情
4. **空狀態友善文案**：每個區塊若無資料都有對應空狀態提示
5. **狀態色保留**：critical=紅、high=橘、normal=藍、low=灰
6. **手機可看，電腦優先**：響應式設計，但以桌面版為主
7. **無 emoji**：沿用現有規則，用 Lucide 圖示

---

## 10. 技術實作計畫

### Phase 1：前端骨架 + 真實公告資料（本次）
- [ ] 新增 `/portal` 選館頁面
- [ ] 新增 `/portal/:facilityId` 值班首頁
- [ ] 建立員工端獨立 Layout（無 Sidebar）
- [ ] 接 `announcement-candidates` API 過濾 approved + facilityName
- [ ] 6 大區塊元件，未接 API 的用空狀態
- [ ] 公告卡片 + 詳情 Drawer（顯示 recommendedReply, badExample）
- [ ] 全域搜尋（前端過濾公告標題/摘要）

### Phase 2：交接 / 活動 / 課程 / 窗口（需後端 API）
- [ ] 串接 facility-home API
- [ ] 交接事項區塊
- [ ] 活動/折扣/課程區塊
- [ ] 聯絡窗口區塊

### Phase 3：排班整合 + 登入（需 Smart Schedule 整合）
- [ ] 串接 Smart Schedule 排班 API
- [ ] 員工登入（LINE Login）
- [ ] 值班人員列表
- [ ] 今日同事顯示

### Phase 4：進階功能
- [ ] 必讀確認機制 (acknowledgement)
- [ ] 角色差異化顯示
- [ ] 任務指派接收
- [ ] 公告推播通知

---

## 11. 檔案結構規劃

```
client/src/
├── pages/
│   ├── portal-select.tsx          // 選館入口頁
│   └── portal-home.tsx            // 值班儀表板首頁
├── components/
│   └── portal/
│       ├── portal-layout.tsx      // 員工端佈局 (全幅，無 Sidebar)
│       ├── top-bar.tsx            // 頂部搜尋欄 + 身份狀態
│       ├── must-read-section.tsx  // 今日必看
│       ├── group-announcement-section.tsx  // 群組公告/規範
│       ├── shift-handover-section.tsx      // 交接事項
│       ├── on-duty-staff-section.tsx       // 值班人員
│       ├── campaign-section.tsx            // 活動/折扣/課程
│       └── announcement-detail-drawer.tsx  // 公告詳情 Drawer
├── types/
│   └── portal.ts                  // 員工端型別定義
└── hooks/
    └── use-facility-home.ts       // 首頁資料 Hook
```

---

## 12. 待確認事項

請 review 以下問題，決定後我就開始建構：

1. **場館選擇方式**：員工進入 `/portal` 後，是選擇場館？還是預設顯示某一館？
2. **第一階段先做哪些館**：文件提到三蘆區 + 松山區，確認？
3. **公告可見性**：員工端是否只能看到 `status=approved` 的公告？還是 `pending_review` 也要顯示（唯讀）？
4. **第三欄（右側直欄）**：架構書第 897-912 行提到右側有「課程會員優惠資訊」直欄，是否第一版就要放？（資料來源？）
5. **員工端 URL 路徑**：用 `/portal` 還是 `/staff` 或其他？
6. **是否需要密碼/登入**：第一階段員工端是否開放存取，還是需要某種簡易驗證？

---

*文件產生時間: 2026-04-07*
*基於: 員工上班入口_架構書 v1 + 前端 Portal 開發指南*
