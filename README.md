# AgentE2EQAWorkflow-Playwright

A worked example of an **AI-agent-driven QA workflow** built on [Playwright Test Agents](https://playwright.dev/docs/test-agents): a user story is turned into a test plan (**planner**), the plan into Playwright tests (**generator**), the tests run across browsers and devices, and failures are fixed or flagged (**healer**). The app under test is the [SauceDemo](https://www.saucedemo.com) e-commerce demo site.

- How it all fits together, with diagrams: **[docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md)** (also as [.docx](docs/AGENT_WORKFLOW.docx))
- Architecture, coverage and known limitations: **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**

## What's here

| Path | Contents |
|---|---|
| [`user-stories/`](user-stories/) | Feature spec — SCRUM-101 e-commerce checkout, with acceptance criteria |
| [`specs/`](specs/) | Test plans written by the planner agent: [checkout](specs/saucedemo-checkout-test-plan.md), [catalog, navigation & user variants](specs/saucedemo-catalog-navigation-test-plan.md) |
| [`tests/saucedemo-checkout/`](tests/saucedemo-checkout/) | 11 spec files, 40 tests — the SCRUM-101 checkout flow |
| [`tests/saucedemo-catalog/`](tests/saucedemo-catalog/) | 7 spec files, 35 tests — login validation, sorting, product details, menu/session, footer, Dynamic Catalog, special users |
| [`tests/pages/`](tests/pages/) | Page Object Model — one class per page, plus the side menu |
| [`tests/fixtures/`](tests/fixtures/) | Test data, and the `setup` project that logs in once and shares the session |
| [`tests/seed.spec.ts`](tests/seed.spec.ts) | Seed test the agents start from (logs in as `standard_user`) |
| [`.claude/agents/`](.claude/agents/), [`.mcp.json`](.mcp.json) | Planner, generator and healer agent definitions + the Playwright MCP server they use |
| [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) | CI pipeline |
| [`test-results/`](test-results/) | The original SCRUM-101 execution report (historical) |

## How to run the project

### 1. Prerequisites

- **Node.js 20+** (CI uses Node 20) and npm
- Git
- Internet access — the tests run against the live https://www.saucedemo.com

### 2. Install

```bash
git clone <repo-url>
cd AgentE2EQAWorkflow-Playwright-main
npm ci                          # installs @playwright/test and TypeScript from package-lock.json
npx playwright install          # downloads Chromium, Firefox and WebKit
                                # on Linux/CI use: npx playwright install --with-deps
```

### 3. Run the tests

```bash
npm test                        # everything: all 7 projects (see table below)
```

Expected result: **277 passed, 27 skipped, 0 failed** (about 2 minutes). The skips are intentional:

- mobile-only tests skip on desktop projects, and the desktop smoke test skips on mobile;
- tests marked `test.fixme()` describe **known defects in SauceDemo itself**, e.g. Reset App State not resetting buttons, or `problem_user`'s broken images. Each has a comment explaining the defect. They will start failing loudly if you remove `fixme`, which is how to check whether a defect has been fixed.

Narrower runs:

```bash
npm run test:chromium                         # desktop Chrome only (plus setup)
npm run test:firefox
npm run test:webkit
npm run test:mobile                           # Pixel 7 + iPhone 14 emulation
npx playwright test tests/saucedemo-catalog   # one folder
npx playwright test -g "Product Sorting"      # tests whose title matches
npm run test:headed                           # watch the browser
npm run test:ui                               # Playwright UI mode (time-travel debugging)
npm run test:debug                            # step through with the Inspector
```

### 4. See the results

```bash
npm run report                  # opens playwright-report/index.html
```

Failed tests keep a screenshot and video in `test-results/artifacts/`; when a test is retried, a trace is recorded too. Open a trace with `npx playwright show-trace <path-to-trace.zip>`.

### 5. Configuration (optional)

No configuration is needed for the public SauceDemo site. To point at another environment or user, set environment variables when you run the tests:

```bash
BASE_URL=https://staging.example.com SAUCEDEMO_USERNAME=me SAUCEDEMO_PASSWORD=secret npm test
```

[`.env.example`](.env.example) lists the variables. Note: nothing loads a `.env` file automatically, so export the variables in your shell (or your CI settings).

### Test projects

Defined in [playwright.config.ts](playwright.config.ts):

| Project | Runs | Session |
|---|---|---|
| `setup` | `tests/fixtures/auth.setup.ts` — logs in once, saves `playwright/.auth/standard_user.json` | — |
| `unauthenticated` | `login`, `login-validation`, `user-variants` and `seed` specs, in Chrome | starts logged out |
| `chromium`, `firefox`, `webkit` | every other spec | reuses the saved session |
| `Mobile Chrome`, `Mobile Safari` | every other spec, on Pixel 7 / iPhone 14 | reuses the saved session |

## Using the AI agents

The planner, generator and healer are Playwright Test Agents, run from **Claude Code** in this folder. They were set up with `npx playwright init-agents --loop=claude`, which generated `.claude/agents/*.md`, `.mcp.json` and `tests/seed.spec.ts`.

1. Open Claude Code in the project root. When it asks, **approve the `playwright-test` MCP server** from `.mcp.json`. This gives the agents a real browser. If you created these files during a session, restart Claude Code so it picks them up.
2. Ask for an agent by name:

| Step | Example prompt | Output |
|---|---|---|
| Plan | *"Use the playwright-test-planner agent to plan tests for user-stories/SCRUM-101-ecommerce-checkout.md"* | a Markdown plan in `specs/` |
| Generate | *"Use the playwright-test-generator agent to generate tests for section 2 of specs/saucedemo-catalog-navigation-test-plan.md"* | `*.spec.ts` files |
| Heal | *"Use the playwright-test-healer agent to fix the failing tests"* | fixed tests, or `test.fixme()` + a comment when the app itself is broken |

3. Review the changes, run `npm test`, then commit.

After upgrading `@playwright/test`, re-run `npx playwright init-agents --loop=claude` to refresh the agent definitions. It keeps the existing `tests/seed.spec.ts`.

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs on every push and pull request to `main`, and can be started manually (**Actions → Playwright Tests → Run workflow**). It installs dependencies and browsers, then runs the full suite with 2 retries and 2 workers. The HTML report is uploaded as the `playwright-report` artifact (kept 14 days), even when tests fail. CI only runs tests. To heal failures, download the report, run the healer agent locally, and push the fix.

## Architecture notes

- **Page Object Model** (`tests/pages/`) — each page wraps its `data-test` locators and actions; tests receive page objects as fixtures from `tests/fixtures.ts`.
- **Shared auth session** — the `setup` project logs in once, and the browser projects reuse it via `storageState`.
- **Centralized test data** (`tests/fixtures/test-data.ts`) — users, product catalog and tax math in one place.
