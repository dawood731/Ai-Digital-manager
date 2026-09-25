# AI Digital Manager — SaaS Web Application

An AI-powered digital employee and operating manager for small businesses and online sellers (initial market: Lahore, Pakistan & expanding). It replaces notebooks, spreadsheets, memory, forgotten WhatsApp chats, and manual follow-ups with intelligent, approval-driven automation.

---

## 🌟 Core Product Philosophy

> **"Let the AI do the repetitive work instead of making the business owner do more data entry."**

The platform operates across three internal capability tiers configured by the owner:
1. **Mode 1: Assistant Mode** — Read-only suggestions and conversational Q&A.
2. **Mode 2: Approval Mode (Default)** — AI prepares accurate drafts (customer replies, draft orders, WhatsApp follow-ups); owner approves with 1 click before anything is executed.
3. **Mode 3: Autonomous Mode** — AI automatically executes allowed routine operations checked in *Settings → AI Permissions*.

---

## 🚀 Key Features

- **Mobile-First UX**: Responsive touch cards, mobile bottom navigation bar (`Home`, `Customers`, `Orders`, `AI`, `More`), and desktop collapsible sidebar.
- **Strict AI Data Safety (Zero Hallucinations)**: The AI service queries verified MongoDB data first. It is mathematically barred from inventing prices, stock, or delivery policies.
- **Roman Urdu, Urdu & English Inquiry Parsing**: Comprehends Pakistani customer queries (e.g. *"Black shirt medium available hai? Lahore delivery kitne din mein hogi?"*) and checks real-time inventory and delivery rules.
- **One-Click Convert Inquiry → Customer → Order**: Automatically extracts or links customer details and creates a confirmed order ticket without re-typing.
- **WhatsApp Click-to-Chat Workflows**: Instant `https://wa.me/92...` link generation with URL-encoded messages and pre-filled templates.
- **Automated Follow-up Board**: Tracks post-delivery customer reviews, pending payments, and re-engagements with AI tone customization (Friendly, Professional, Short, Persuasive).
- **Automation Engine**: Event-driven rules (`ORDER_DELIVERED`, `PAYMENT_PENDING`, `STOCK_LOW`, `INQUIRY_RECEIVED`) with execution audit logs.
- **Deterministic Analytics & AI Insights**: Mathematical calculation of sales, AOV, repeat buyer rate, and pipeline status, paired with strategic bullet-point recommendations by Google Gemini.
- **Multi-Tenant SaaS Architecture**: Strict tenant isolation at the database query level via `businessId`. Role-based access control (`USER`/`BUSINESS_OWNER` vs `ADMIN`).
- **Pakistan Localization**: Currency formatted in Pakistani Rupee (PKR / `Rs.`), Lahore delivery configurations, and phone formatting (`+92 3XX XXXXXXX`).
- **Super Admin Panel**: Full visibility over tenant businesses, user accounts, and audit trails at `/admin`.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Components, Route Handlers)
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, clsx, tailwind-merge
- **Database & ODM**: MongoDB Atlas with Mongoose connection pooling & resilient local development fallback
- **AI Engine**: Google Gemini API (`gemini-3.6-flash`) with structured prompts & safety guards
- **Authentication**: Stateless secure JWT session cookies via `jose` and `bcryptjs`
- **Channel Abstraction**: Modular `ChannelProvider` interface (`WhatsAppProvider`, `InstagramProvider`)

---

## 📂 Project Structure

```
ai-digital-manager/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Desktop sidebar & mobile bottom navigation
│   │   ├── dashboard/page.tsx    # Daily operations KPI overview & AI manager alert
│   │   ├── customers/page.tsx    # CRM profiles & AI customer factual summary
│   │   ├── products/page.tsx     # Catalog & real-time inventory tracking
│   │   ├── orders/page.tsx       # Order pipeline & delivery status updates
│   │   ├── inquiries/page.tsx    # Customer leads & Convert-to-Order workflow
│   │   ├── followups/page.tsx    # WhatsApp follow-up board with AI rewriter
│   │   ├── ai-manager/page.tsx   # Studio: Q&A chat, reply generator & drafter
│   │   ├── automations/page.tsx  # Trigger-Condition-Action automation engine
│   │   ├── analytics/page.tsx    # Deterministic metrics & Gemini strategic insights
│   │   ├── settings/page.tsx     # Delivery rules & granular AI permission toggles
│   │   └── subscription/page.tsx # Free trial status, usage meters & tier upgrade
│   ├── admin/page.tsx            # Super Admin platform control panel
│   ├── login/page.tsx            # Auth login with 1-click demo auto-fill
│   ├── signup/page.tsx           # 3-step onboarding wizard
│   ├── page.tsx                  # Public SaaS landing page
│   ├── layout.tsx                # Root layout & responsive viewport
│   └── globals.css               # Mobile-first Tailwind styling
├── lib/
│   ├── mongodb.ts                # Mongoose connection pooling & fallback
│   ├── auth.ts                   # JWT session signing & bcrypt password hashing
│   ├── tenant.ts                 # Tenant authorization middleware guard
│   ├── utils.ts                  # PKR currency and date formatters
│   ├── seedData.ts               # Pakistani demo business seed generator
│   └── ai/
│       └── gemini.ts             # Google Gemini API client
├── models/                       # Mongoose schemas (User, Business, Customer, Product, Order, etc.)
├── services/
│   ├── aiService.ts              # Verified context assembly & prompt engineering
│   ├── automationEngine.ts       # Trigger dispatcher & action executor
│   └── channels/                 # WhatsApp & Instagram channel providers
└── scripts/
    ├── e2e-test.mjs              # End-to-end integration test suite
    └── test-db.mjs               # Database connectivity verification
```

---

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster0.zyx26ap.mongodb.net/ai_digital_manager?retryWrites=true&w=majority

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret (min 32 characters)
AUTH_SECRET=dawood_ai_digital_manager_super_secure_secret_2026_jwt_token_key_lahore

# Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🏃 Quick Start & Local Run

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Or create an optimized production build**:
   ```bash
   npm run build
   npm run start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demo Accounts & Seed Data

You can seed or reset the database instantly by clicking **"Reset / Seed Demo Database"** on `/login` or by calling:
```bash
node scripts/e2e-test.mjs
```

### Seeded Credentials:
- **Business Owner Account**:
  - **Email**: `demo@dawoodfashion.pk`
  - **Password**: `password123`
  - **Business**: *Dawood Fashion* (Liberty Market, Gulberg III, Lahore)
  - **Pre-loaded with**: 5 apparel products, 4 customer profiles, 4 orders, 2 Roman Urdu inquiries, 2 follow-ups, and 4 automations.

- **Platform Admin Account**:
  - **Email**: `admin@aidigitalmanager.com`
  - **Password**: `admin123`
  - **Access**: Super Admin Panel at `/admin`

---

## 🚀 Deployment Instructions (Vercel)

1. Push your repository to **GitHub**.
2. Connect your repository on [Vercel](https://vercel.com).
3. In **Project Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `GEMINI_API_KEY`
   - `AUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. In your **MongoDB Atlas** console:
   - Navigate to **Network Access**.
   - Add `0.0.0.0/0` (Allow Access from Anywhere) so Vercel serverless functions can connect.
5. Deploy! Vercel will automatically build and deploy the Next.js App Router application.
