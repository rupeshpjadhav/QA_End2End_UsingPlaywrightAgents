# AgentE2EQAWorkflow-Playwright — Project Overview

## 1. What This Project Is

This repository documents and automates an **AI-agent-driven QA workflow**: a user story is turned into a test plan, the test plan into Playwright automation, the automation is executed across browsers and devices, and the cycle is written up as a report — for the checkout flow on the public demo site [saucedemo.com](https://www.saucedemo.com).

It started as a documentation-only bundle (a user story, a test plan, 5 spec files, and a report — no way to actually install or run anything). It is now a **complete, runnable Playwright/TypeScript project**: dependencies, config, a page-object layer, all 10 planned test-scenario groups implemented (40 test cases), CI, and version control.

**Target application under test:** `https://www.saucedemo.com` (Sauce Labs' public e-commerce demo)
**Test credentials:** `standard_user` / `secret_sauce`
**Feature under test:** SCRUM-101 — E-commerce Checkout Process

---

## 2. Folder Structure

```
AgentE2EQAWorkflow-Playwright-main/
├── README.md                                    # Quick start, project summary
├── PROJECT_OVERVIEW.md                          # this file
├── package.json                                 # dependencies + npm scripts
├── package-lock.json
├── playwright.config.ts                         # projects, baseURL, reporters, auth setup wiring
├── tsconfig.json
├── .gitignore
├── .env.example                                 # BASE_URL / credential overrides (optional)
│
├── .github/workflows/
│   └── playwright.yml                           # CI: installs browsers, runs full suite, uploads HTML report
│
├── user-stories/
│   └── SCRUM-101-ecommerce-checkout.md          # Requirements: story, ACs, business rules, DoD
│
├── specs/
│   └── saucedemo-checkout-test-plan.md          # Test plan: 10 scenario groups, 60+ planned test cases
│
├── tests/
│   ├── fixtures.ts                              # Custom `test`/`expect` — injects page-object fixtures
│   ├── fixtures/
│   │   ├── test-data.ts                         # Centralized credentials, products, tax rate, helpers
│   │   └── auth.setup.ts                        # "setup" project: logs in once, saves session storageState
│   ├── pages/                                   # Page Object Model
│   │   ├── LoginPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInfoPage.ts                  # checkout-step-one.html
│   │   ├── CheckoutOverviewPage.ts              # checkout-step-two.html
│   │   └── CheckoutCompletePage.ts
│   └── saucedemo-checkout/                      # 11 spec files, 40 test cases
│       ├── login.spec.ts                        # NEW — unauthenticated login flow (AC: "must be logged in")
│       ├── complete-checkout-flow.spec.ts        # E2E happy path
│       ├── cart-review.spec.ts                   # AC1 cart functionality
│       ├── checkout-information-validation.spec.ts # AC2/AC5 form validation
│       ├── order-overview.spec.ts                # AC3 order summary
│       ├── order-completion.spec.ts              # AC4 confirmation & reset
│       ├── error-handling-edge-cases.spec.ts     # NEW — AC5 special chars, long input, rapid clicks, back button
│       ├── navigation-flows.spec.ts              # NEW — Cancel/Continue Shopping paths, cart integrity
│       ├── price-calculations.spec.ts            # NEW — tax/total math, all-6-products, formatting
│       ├── cross-browser-compatibility.spec.ts   # NEW — smoke test run by the chromium/firefox/webkit projects
│       └── mobile-responsiveness.spec.ts         # NEW — runs only on Mobile Chrome / Mobile Safari projects
│
└── test-results/
    └── SCRUM-101-checkout-test-report.md         # Original manual + automated execution report (historical)
```

`node_modules/`, `playwright-report/`, `test-results/artifacts/`, and `playwright/.auth/` are generated at run time and excluded via `.gitignore`.

---

## 3. The Documented Workflow (User Story → Report)

```
user-stories/  →  specs/  →  tests/  →  test-results/
 (what to build)  (how to test it) (automation code) (what happened)
```

### Step 1 — `user-stories/SCRUM-101-ecommerce-checkout.md`
The feature as a standard agile story: title, description, 5 acceptance criteria (AC1–AC5, Gherkin-flavored GIVEN/WHEN/THEN), 5 business rules, technical notes (Playwright, cross-browser, mobile, validation, navigation), and a Definition of Done checklist.

### Step 2 — `specs/saucedemo-checkout-test-plan.md`
Translates the story into 10 scenario groups covering 60+ individual test steps, each mapped to a target spec file and step-by-step expectations. **All 10 groups are now implemented** (see Section 4).

### Step 3 — `tests/saucedemo-checkout/*.spec.ts`
11 spec files, 40 test cases, built on a shared Page Object Model (`tests/pages/`) and fixture layer (`tests/fixtures.ts`), running across 5 browser/device projects (chromium, firefox, webkit, Mobile Chrome, Mobile Safari) plus a dedicated unauthenticated project for login coverage.

### Step 4 — `test-results/SCRUM-101-checkout-test-report.md`
The original execution report (manual exploratory testing + first automated run + a documented "healing" pass that fixed 2 failing tests). Kept as-is as the historical record of the initial cycle — it predates the scaffolding and additional suites added since.

---

## 4. Test Coverage — Plan vs. Implementation

All 10 scenario groups from `specs/saucedemo-checkout-test-plan.md` now have an implementation:

| # | Scenario group | Spec file | Tests |
|---|---|---|---|
| — | Login (business rule: must be authenticated) | `login.spec.ts` | 4 |
| 1.1 | Complete Checkout Flow — Happy Path | `complete-checkout-flow.spec.ts` | 1 |
| 1.2 | Cart Review Functionality (AC1) | `cart-review.spec.ts` | 5 |
| 1.3 | Checkout Information Entry Validation (AC2) | `checkout-information-validation.spec.ts` | 5 |
| 1.4 | Order Overview Verification (AC3) | `order-overview.spec.ts` | 5 |
| 1.5 | Order Completion Confirmation (AC4) | `order-completion.spec.ts` | 3 |
| 1.6 | Error Handling and Edge Cases (AC5) | `error-handling-edge-cases.spec.ts` | 5 |
| 1.7 | Navigation Flow Testing | `navigation-flows.spec.ts` | 4 |
| 1.8 | Price Calculation and Tax Verification | `price-calculations.spec.ts` | 4 |
| 1.9 | Cross-Browser Compatibility | `cross-browser-compatibility.spec.ts` (+ every other spec, run by the chromium/firefox/webkit projects) | 1 |
| 1.10 | Mobile Responsiveness | `mobile-responsiveness.spec.ts` (Mobile Chrome / Mobile Safari projects only) | 3 |
| | **Total unique test cases** | | **40** |

**How cross-browser and mobile coverage actually work:** rather than hand-writing the same E2E flow three times per browser, `playwright.config.ts` defines `chromium`, `firefox`, and `webkit` projects that each run the *entire* `tests/saucedemo-checkout/` directory. `cross-browser-compatibility.spec.ts` is a thin, explicit smoke test satisfying plan item #1.9 by name; the real cross-browser coverage is every other spec running 3x. Similarly, `mobile-responsiveness.spec.ts` self-skips outside the `Mobile Chrome` / `Mobile Safari` projects (device emulation via Playwright's `devices` presets — Pixel 7 and iPhone 14) rather than hand-rolling viewport overrides.

**Verified result (2026-08-17):** `npx playwright test` across all 7 projects (setup, unauthenticated, chromium, firefox, webkit, Mobile Chrome, Mobile Safari) → **174 passed, 0 failed, 11 skipped by design** (mobile-only tests skipping on desktop projects, and vice versa for the cross-browser smoke test).

---

## 5. Architecture Decisions

### 5.1 Page Object Model (`tests/pages/`)
Each SauceDemo page (`LoginPage`, `ProductsPage`, `CartPage`, `CheckoutInfoPage`, `CheckoutOverviewPage`, `CheckoutCompletePage`) is a class wrapping its `data-test` locators and the user actions available on it. Specs call methods like `productsPage.addToCart(key)` or `checkoutInfoPage.fillInfo({...})` instead of repeating raw `page.locator(...)` calls — this was the single biggest duplication gap in the original 5 specs (every file re-implemented login and navigation inline).

### 5.2 Centralized test data (`tests/fixtures/test-data.ts`)
Credentials, product catalog (name/price/`data-test` key per SKU), the 8% tax rate, and a `calculateTotals()` helper live in one module instead of being retyped as string literals in every spec. Credentials default to `standard_user` / `secret_sauce` but can be overridden via `SAUCEDEMO_USERNAME` / `SAUCEDEMO_PASSWORD` env vars (see `.env.example`).

### 5.3 Authenticated session reuse (`tests/fixtures/auth.setup.ts`)
A Playwright **setup project** logs in once as `standard_user` and saves the session to `playwright/.auth/standard_user.json`. The `chromium`, `firefox`, `webkit`, `Mobile Chrome`, and `Mobile Safari` projects declare it as a dependency and reuse that `storageState`, so individual specs skip repeating the login flow in every `beforeEach`. This replaces the shared `tests/seed.spec.ts` referenced (but never implemented) in the original test plan, using Playwright's idiomatic project-dependency pattern instead of a literal seed test.

Login itself is still fully tested — `login.spec.ts` runs under a separate `unauthenticated` project with no stored session, verifying successful login, a locked-out user, an invalid password, and that checkout is unreachable pre-login.

### 5.4 Custom fixtures (`tests/fixtures.ts`)
Extends Playwright's base `test` to inject `loginPage`, `productsPage`, `cartPage`, `checkoutInfoPage`, `checkoutOverviewPage`, and `checkoutCompletePage` directly into test signatures — no manual `new XPage(page)` construction inside test bodies.

---

## 6. "Agents" in This Workflow

There is still no agent *orchestration code* in this repository (no `.claude/agents/`, no subagent prompt files) — "agent" describes **roles an AI coding assistant played across a session**, reconstructed from the artifacts:

| Stage | Implied "agent" role | Evidence | Output |
|---|---|---|---|
| 1 | Requirements / Product-owner agent | Well-formed story with Gherkin ACs | `user-stories/SCRUM-101-ecommerce-checkout.md` |
| 2 | QA test-planner agent | Structured, numbered scenario breakdown mapped to ACs | `specs/saucedemo-checkout-test-plan.md` |
| 3 | Test-automation agent | Playwright/TS specs using discovered `data-test` selectors | `tests/saucedemo-checkout/*.spec.ts` |
| 4 | Exploratory/manual-testing agent | Step-by-step manual test log, selectors discovered live | `test-results/...md` §2 |
| 5 | `playwright-test-healer` agent | Named explicitly in the report; diagnosed and patched 2 failing assertions | `test-results/...md` §3 |
| 6 | Reporting agent | Coverage matrix, risk assessment, sign-off recommendation | `test-results/...md` §5–6 |

The scaffolding, page objects, and 5 new spec files added in this pass were built directly (not through a separate named agent), following the recommendations the original report itself made in its "Future Enhancements" section.

---

## 7. Running the Tests

```bash
npm install
npx playwright install          # downloads chromium/firefox/webkit binaries

npm test                        # full matrix: chromium, firefox, webkit, Mobile Chrome, Mobile Safari
npm run test:chromium           # single browser
npm run test:mobile             # Mobile Chrome + Mobile Safari only
npm run test:headed             # watch it run
npm run test:ui                 # Playwright's interactive UI mode
npm run report                  # open the last HTML report
```

No `.env` is required to run against the public SauceDemo target — `playwright.config.ts` and `tests/fixtures/test-data.ts` fall back to the documented defaults. Copy `.env.example` to `.env` only to point at a different `BASE_URL` or credential set.

CI (`.github/workflows/playwright.yml`) runs the full suite with 2 retries on push/PR to `main` and uploads the HTML report as a build artifact.

---

## 8. Known Limitations / Remaining Gaps

- **No visual regression / screenshot-comparison tests** — flagged as a future enhancement in the original report, still not implemented.
- **No API-level tests** — not applicable to SauceDemo (it has no real backend), but noted here since the original report recommended it.
- **No dedicated security tests** (XSS/SQL-injection payloads in form fields) — the original report flagged this as "High priority, separate security sprint"; still out of scope for this suite.
- **No performance/page-load-time assertions.**
- **Running the full 7-project matrix locally executes `beforeEach` logins and full flows in parallel against the live public saucedemo.com site** — under heavy parallel load this can occasionally hit a transient network timeout (observed once during verification, on a fresh worker's initial `page.goto`; it passed on immediate retry and CI already retries twice for exactly this reason). Not a defect in the tests or the app.
- **The historical `test-results/SCRUM-101-checkout-test-report.md` was not regenerated** — it accurately documents the *original* 5-suite/20-test cycle, not the current 11-suite/40-test one. A fresh report could be generated with `npm test` + `npm run report` if an updated execution record is needed.

---

*This document reflects the state of the repository after adding project scaffolding, a page-object/fixture layer, and the 5 previously-unimplemented test suites, all verified by running the full suite against the live application.*
