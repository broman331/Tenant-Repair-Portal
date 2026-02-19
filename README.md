# Tenant Repair Request Portal

A mini proof-of-concept demonstrating a **modern automated testing architecture** using **Playwright + TypeScript** for a tenant repair request portal, built with **React**, **Tailwind CSS**, and an **Express** mock API.

---

## 🏗️ Architecture

```
┌────────────────────┐                                      ┌────────────────────┐
│   React Frontend   │  POST /api/repair-requests           │  Express Mock API  │
│   (Vite + Tailwind)│ ──────────────────────────────────▶  │  (Node.js + TS)    │
│   :3000            │ ◀────── 201 { ticketId }             │  :4000             │
└────────────────────┘                                      └────────────────────┘
         ▲                                                           ▲
         │                                                           │
         └──────────────── Playwright Test Suite ────────────────────┘
                        (Page Object Model Pattern)
```

## 📦 Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Tailwind CSS 3, Vite 6, React Router 7 |
| API      | Express 4, uuid, in-memory store        |
| Testing  | Playwright 1.50, TypeScript 5.7         |
| Runtime  | Node.js 18+                             |

## ✨ Features

| Feature       | Route          | Description                                       |
|---------------|----------------|---------------------------------------------------|
| New Request   | `/`            | Form with validation → submits → shows ticket ID  |
| Ticket List   | `/tickets`     | Table view with priority/status badges             |
| Ticket Detail | `/tickets/:id` | Full ticket info + assign worker dropdown          |
| Workers       | `/workers`     | Add/delete maintenance workers by specialization   |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install chromium

# 3. Start the app (API + Frontend concurrently)
npm run dev

# 4. (Optional) Seed with sample data
npx tsx scripts/seed.ts
```

The frontend runs at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:4000](http://localhost:4000).

## 🧪 Running Tests

```bash
# Run all tests (headless) — auto-starts API + frontend
npm test

# Run tests with Playwright UI (interactive mode)
npm run test:ui

# View the last HTML test report
npm run test:report
```

> **Note**: The `webServer` config in `playwright.config.ts` automatically starts both the API and frontend servers before running tests. No manual server startup required.

---

## 📂 Project Structure

```
├── src/
│   ├── api/server.ts                    # Express mock API (8 endpoints)
│   ├── app/
│   │   ├── components/
│   │   │   ├── RepairRequestForm.tsx    # Form with client-side validation
│   │   │   ├── SuccessMessage.tsx       # Submission confirmation + View Ticket link
│   │   │   ├── Layout.tsx              # Sidebar navigation shell
│   │   │   ├── TicketList.tsx          # Ticket table with badges
│   │   │   ├── TicketDetail.tsx        # Detail view + worker assignment
│   │   │   └── WorkerList.tsx          # Workers CRUD management
│   │   ├── types/RepairRequest.ts      # TypeScript interfaces
│   │   ├── App.tsx                     # React Router setup
│   │   ├── main.tsx                    # Entry point
│   │   └── index.css                   # Tailwind + design tokens
│   └── shared/constants.ts            # Shared enums & config
├── tests/
│   ├── pages/                          # Page Object Models
│   │   ├── RepairRequestPage.ts
│   │   ├── TicketListPage.ts
│   │   ├── TicketDetailPage.ts
│   │   └── WorkerListPage.ts
│   ├── fixtures/testData.ts            # Reusable test data
│   ├── functional/                     # UI functional tests
│   │   ├── repairRequest.spec.ts       # Green path
│   │   ├── ticketList.spec.ts          # Ticket list
│   │   ├── ticketDetail.spec.ts        # Ticket detail + assignment
│   │   └── workers.spec.ts            # Workers management
│   ├── validation/
│   │   └── formValidation.spec.ts     # Form validation rules
│   └── api/
│       └── repairEndpoint.spec.ts     # API contract tests
├── scripts/seed.ts                     # Sample data seeder
├── playwright.config.ts
└── package.json
```

---

## 🔌 API Endpoints

| Method  | Endpoint                           | Status Codes     |
|---------|------------------------------------|------------------|
| `POST`  | `/api/repair-requests`             | 201 / 400        |
| `GET`   | `/api/repair-requests`             | 200              |
| `GET`   | `/api/repair-requests/:id`         | 200 / 404        |
| `PATCH` | `/api/repair-requests/:id/assign`  | 200 / 400 / 404  |
| `POST`  | `/api/workers`                     | 201 / 400        |
| `GET`   | `/api/workers`                     | 200              |
| `DELETE`| `/api/workers/:id`                 | 200 / 404        |
| `GET`   | `/api/health`                      | 200              |

### Example — Submit a Repair Request

```bash
curl -X POST http://localhost:4000/api/repair-requests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jan de Vries",
    "address": "Keizersgracht 123, 1015 CJ Amsterdam",
    "issueType": "Plumbing",
    "priority": "High",
    "description": "Kitchen faucet leaking"
  }'
```

```json
{
  "status": "created",
  "message": "Repair request submitted successfully",
  "ticketId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🧩 Test Strategy (POM Pattern)

The test suite follows the **Page Object Model** design pattern, separating page interactions from test assertions.

### Page Object Models

| POM                     | Purpose                          |
|-------------------------|----------------------------------|
| `RepairRequestPage.ts`  | Form fill, submit, error access  |
| `TicketListPage.ts`     | Table rows, navigation           |
| `TicketDetailPage.ts`   | Detail fields, worker assignment |
| `WorkerListPage.ts`     | Add/delete workers               |

### Test Coverage — 27 Tests

| Category           | File                        | Tests | What it validates                              |
|--------------------|-----------------------------|-------|------------------------------------------------|
| API — Requests     | `repairEndpoint.spec.ts`    | 15    | REST contract: 201/400/404, unique IDs, CRUD   |
| Functional — Form  | `repairRequest.spec.ts`     | 2     | Green path: submit → success + ticket ID       |
| Functional — List  | `ticketList.spec.ts`        | 2     | Table display, navigation to detail            |
| Functional — Detail| `ticketDetail.spec.ts`      | 2     | Field display, worker assignment               |
| Functional — Workers| `workers.spec.ts`          | 3     | Add worker, delete worker, validation          |
| Validation         | `formValidation.spec.ts`    | 3     | Empty/partial submit, error clearing           |

### Key Design Decisions

- **Shared in-memory state resilience**: Tests use unique `Date.now()` suffixed names and relative count assertions to handle parallel execution.
- **Auto-start servers**: Playwright `webServer` config starts both API and Vite automatically before running tests.
- **`data-testid` attributes**: All interactive elements use stable test IDs for reliable, non-brittle selectors.
- **Centralized test data**: Reusable fixtures in `testData.ts` to avoid duplication across spec files.
