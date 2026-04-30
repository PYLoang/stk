# 📦 Stock Tracking Web App — Project Plan

> A full-stack inventory management system built with Next.js, designed for AI-assisted (vibe) coding.

---

## 1. Project Overview

**App Name:** `stk`
**Goal:** Manage shop inventory with categorized stocks, track import/export movements per round, and log all stock & non-stock transactions.

**Core Entities:**
- **Stock** — individual item in shop (1 item = 1 stock record)
- **Stock Category** — grouping for stocks
- **Stock Movement** — round-based batch operation (import or export)
- **Stock Transaction (Txn)** — individual transaction line, either tied to a stock or a free-form subject

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router) | Full-stack in one project, AI-friendly |
| Language | **TypeScript** | Type safety for forms & DB models |
| Styling | **Tailwind CSS** + **shadcn/ui** | Pre-built accessible components |
| Forms | **React Hook Form** + **Zod** | Validation for required fields & conditional rules |
| Database | **PostgreSQL** (Neon) or **SQLite** (local) | Free tier, AI-familiar |
| ORM | **Prisma** | Type-safe queries, easy migrations |
| Backend | **Server Actions** | No separate API needed |
| Hosting | **Vercel** | One-click deploy |

---

## 3. Data Model

### 3.1 Entity Relationships

```
Category (1) ─────< (N) Stock
                         │
                         │ (N)
                         ▼
                    MovementItem (junction)
                         ▲
                         │ (N)
                         │
Movement (1) ────< (N) MovementItem

Stock (1) ─────< (N) Txn
Subject (string field on Txn — alternative to Stock)
```

### 3.2 Field Specifications

#### **Stock**
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid) | ✅ | Auto-generated |
| name | String | ✅ | Item name |
| quantity | Int | ❌ | Defaults to 0 |
| price | Decimal | ✅ | Unit price |
| categoryId | String | ✅ | FK to Category |
| createdAt / updatedAt | DateTime | Auto | |

#### **Stock Category**
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid) | ✅ | Auto-generated |
| name | String | ✅ | Category name (unique) |
| stocks | Relation | — | One-to-many to Stock |

#### **Stock Movement**
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid) | ✅ | Auto-generated |
| code | String | ✅ | Unique movement code |
| type | Enum (`IMPORT` / `EXPORT`) | ✅ | One type per round |
| remark | String | ❌ | Free-form notes |
| items | Relation | — | At least 1 stock required |
| createdAt | DateTime | Auto | |

#### **Stock Txn (Transaction)**
| Field | Type | Required | Notes |
|---|---|---|---|
| id | String (cuid) | ✅ | Auto-generated |
| stockId | String? | ⚠️ | Either `stockId` OR `subject` (XOR) |
| subject | String? | ⚠️ | Either `stockId` OR `subject` (XOR) |
| type | Enum (`IMPORT` / `EXPORT`) | ✅ | |
| quantity | Int | ✅ | |
| price | Decimal | ✅ | |
| remark | String | ❌ | |
| createdAt | DateTime | Auto | |

> **Validation Rule:** Exactly one of `stockId` or `subject` must be present (enforced via Zod refinement + DB check constraint).

### 3.3 Prisma Schema (Draft)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "sqlite" for local
  url      = env("DATABASE_URL")
}

enum TxnType {
  IMPORT
  EXPORT
}

model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  stocks Stock[]
}

model Stock {
  id         String         @id @default(cuid())
  name       String
  quantity   Int            @default(0)
  price      Decimal        @db.Decimal(12, 2)
  categoryId String
  category   Category       @relation(fields: [categoryId], references: [id])
  movements  MovementItem[]
  txns       Txn[]
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
}

model Movement {
  id        String         @id @default(cuid())
  code      String         @unique
  type      TxnType
  remark    String?
  items     MovementItem[]
  createdAt DateTime       @default(now())
}

model MovementItem {
  id         String   @id @default(cuid())
  movementId String
  stockId    String
  quantity   Int
  movement   Movement @relation(fields: [movementId], references: [id], onDelete: Cascade)
  stock      Stock    @relation(fields: [stockId], references: [id])

  @@unique([movementId, stockId])
}

model Txn {
  id        String   @id @default(cuid())
  stockId   String?
  subject   String?
  type      TxnType
  quantity  Int
  price     Decimal  @db.Decimal(12, 2)
  remark    String?
  stock     Stock?   @relation(fields: [stockId], references: [id])
  createdAt DateTime @default(now())
}
```

---

## 4. App Structure

```
stk/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── stocks/
│   │   │   ├── page.tsx                # List
│   │   │   ├── new/page.tsx            # Create
│   │   │   └── [id]/edit/page.tsx      # Edit
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── movements/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx           # View movement detail
│   │   └── transactions/
│   │       ├── page.tsx
│   │       └── new/page.tsx
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── forms/
│   │   │   ├── stock-form.tsx
│   │   │   ├── category-form.tsx
│   │   │   ├── movement-form.tsx
│   │   │   └── txn-form.tsx
│   │   └── tables/
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma client singleton
│   │   ├── validations/                # Zod schemas
│   │   └── utils.ts
│   └── actions/                        # Server Actions
│       ├── stock.ts
│       ├── category.ts
│       ├── movement.ts
│       └── txn.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 5. Build Roadmap

### Phase 1 — Setup (30 min)
1. Run `npx create-next-app@latest stk` (TypeScript, Tailwind, App Router, src dir)
2. Install Prisma, Zod, React Hook Form, shadcn/ui
3. Configure database connection in `.env`
4. Initialize shadcn/ui and add base components

### Phase 2 — Database (1 hour)
1. Define Prisma schema (use draft above)
2. Run `npx prisma migrate dev --name init`
3. Create Prisma client singleton in `src/lib/prisma.ts`
4. Write seed script with sample categories & stocks
5. Run `npx prisma db seed`

### Phase 3 — Validation Layer (45 min)
1. Create Zod schemas for each entity in `src/lib/validations/`
2. Implement XOR refinement for Txn (stock vs subject)
3. Add `min(1)` refinement on Movement items array

### Phase 4 — Server Actions (2 hours)
1. CRUD actions for Category
2. CRUD actions for Stock (with category relation)
3. CRUD actions for Movement (with auto stock quantity adjustment)
4. CRUD actions for Txn (with conditional stock vs subject handling)

### Phase 5 — UI Pages (3-4 hours)
1. Dashboard with summary cards (total stocks, recent movements, low stock alerts)
2. Categories: list, create, edit, delete
3. Stocks: list with filters, create, edit, delete
4. Movements: list, create (multi-select stocks), view detail
5. Transactions: list, create (toggle between stock/subject mode)

### Phase 6 — Polish (1-2 hours)
1. Loading states & error boundaries
2. Toast notifications for actions
3. Confirmation dialogs for deletes
4. Responsive layout check
5. Empty states for tables

### Phase 7 — Deploy (15 min)
1. Push to GitHub
2. Connect repo to Vercel
3. Add `DATABASE_URL` env var in Vercel dashboard
4. Deploy

---

## 6. Key Business Logic Notes

### 6.1 Movement Auto-Adjusts Stock Quantity
When a Movement is created:
- If `type = IMPORT` → increase each `Stock.quantity` by `MovementItem.quantity`
- If `type = EXPORT` → decrease each `Stock.quantity` by `MovementItem.quantity`
- Wrap in a Prisma `$transaction` for atomicity
- Validate export doesn't exceed available stock

### 6.2 Transaction XOR Validation
```typescript
// src/lib/validations/txn.ts
const txnSchema = z.object({
  stockId: z.string().optional(),
  subject: z.string().optional(),
  type: z.enum(['IMPORT', 'EXPORT']),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  remark: z.string().optional(),
}).refine(
  (data) => (data.stockId && !data.subject) || (!data.stockId && data.subject),
  { message: 'Must provide either stock or subject, not both' }
);
```

### 6.3 Movement Code Generation
Suggest auto-generating codes like `MV-20260430-001` (date + sequence) so users don't need to invent them manually.

---

## 7. AI Vibe-Coding Tips

When using Cursor / Claude Code / v0:

1. **Feed the Prisma schema first** — give the AI full context of your data model before asking for components.
2. **Build one entity end-to-end** before moving to the next (schema → action → form → page).
3. **Use shadcn's CLI** to add components on demand (`npx shadcn@latest add data-table`).
4. **Ask for Zod schemas alongside forms** — keeps validation consistent.
5. **Generate seed data** for testing UI without manual data entry.

### Recommended AI Prompts

> "Generate a Next.js Server Action that creates a Stock Movement, validates with Zod, and updates each related Stock's quantity in a Prisma transaction."

> "Create a shadcn/ui form for the Txn entity with a toggle that switches between selecting an existing Stock and entering a free-form Subject."

> "Build a data table page for Stocks with filtering by Category, sorting by name/quantity/price, and edit/delete row actions."

---

## 8. Future Enhancements (Optional)

- 🔐 **Authentication** — NextAuth.js with email/Google login
- 📊 **Reports** — monthly movement summary, top-moving stocks
- 📱 **Barcode scanning** — for fast stock entry (using `quagga.js`)
- 🌍 **Multi-currency** — if shop deals internationally
- 📤 **Export to CSV/Excel** — for accounting
- 🔔 **Low-stock alerts** — email or in-app notifications
- 👥 **Multi-user / roles** — owner, staff, viewer

---

## 9. Estimated Total Time

| Skill Level | Estimated Build Time |
|---|---|
| Experienced + AI assist | 6–8 hours |
| Beginner + AI assist | 1–2 weekends |
| No AI (manual) | 3–5 days |

---

## 10. Quick Start Commands

```bash
# 1. Create project
npx create-next-app@latest stk --typescript --tailwind --eslint --app --src-dir --use-npm

cd stk

# 2. Install dependencies
npm install prisma @prisma/client zod react-hook-form @hookform/resolvers
npm install -D tsx

# 3. Initialize Prisma
npx prisma init

# 4. Setup shadcn/ui
npx shadcn@latest init -d
npx shadcn@latest add button input label select textarea form table dialog card toast

# 5. After editing schema.prisma, run:
npx prisma migrate dev --name init
npx prisma generate

# 6. Start dev server
npm run dev
```

---

**Ready to build! 🚀**
Start with Phase 1, then feed this plan section-by-section into your AI coding tool.