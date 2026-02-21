# Project State

## Current Phase
Phase 03: Processing & Results (React)

## Current Plan
03-01: COMPLETE — Backend prerequisites (results/cancel/retry-image endpoints + StaticFiles)
03-02: Pending — Processing step (React)
03-03: Pending — Results step (React)

## Recent Milestones
- [x] Codebase exploration completed.
- [x] Initial configuration questions answered.
- [x] `.planning/PROJECT.md` and `config.json` created.
- [x] Phase 1: Backend Foundation (FastAPI Integration) completed.
- [x] Phase 2 Execution Plan created (02-01, 02-02, 02-03).
- [x] Frontend Project Initialized with Parchment Theme & Shell (02-01).
- [x] Step 1: Upload Workflow & Backend API integration (02-02).
- [x] Step 2: Configuration & Field Management (02-03).
- [x] Phase 2: Frontend Scaffold & Configuration (React) completed.
- [x] Phase 02.1 Plan 01: Turborepo monorepo migration (apps/ + packages/ restructure).
- [x] Phase 02.1 Plan 02: Backend package.json wrapper, frontend workspace rename, setup script.
- [x] Phase 02.1 Plan 03: Shared types package with JSON Schema + TypeScript codegen.
- [x] Phase 03 Plan 01: Backend prerequisites for Processing & Results (results/cancel/retry-image + StaticFiles).

## Active Tasks
- [ ] Execute Phase 03 Plan 02: Processing step (React).
- [ ] Execute Phase 03 Plan 03: Results step (React).

## Key Decisions
- **Target Platform:** Web GUI.
- **Backend:** FastAPI (to wrap existing Python logic).
- **Frontend:** React + Tailwind + Vite (Parchment theme).
- **OCR Engine:** Keep Qwen3-VL via OpenRouter.
- **State Management:** Zustand with persistent storage.
- **Aesthetic:** "Museum/Archive" theme with serif fonts and paper textures.
- **Tailwind version:** 3.4 (not 4.x) for stable PostCSS plugin ecosystem.
- **Sidebar navigation:** Display-only; step transitions only via store actions to enforce wizard order.
- **Font loading:** Crimson Text + IBM Plex Mono via Google Fonts CDN import in index.css.
- **Monorepo layout:** apps/frontend, apps/backend, apps/legacy, packages/ (Turborepo convention).
- **Single root .env:** Both frontend (Vite envDir) and backend (pydantic-settings tuple) read from repo root.
- **Local caching only:** No remote Turborepo cache.
- **Task pipeline:** typecheck before build, lint independent, test after build (locked).
- **Atomic migration commit:** Entire directory restructure in single git commit for clean history.
- **Backend npm wrapper: zero npm deps** — all Python deps managed by uv via requirements files to avoid workspace hoisting issues.
- **Port conflict detection:** Inline Node net.createServer in dev scripts (cross-platform, no bash-isms).
- **Frontend test placeholder:** echo 'No tests yet' — turbo won't fail before vitest is wired.
- **Shared types codegen: custom converter** — json-schema-to-typescript generates duplicate helper types; custom jsonSchemaTypeToTs() produces clean inline types without aliases.
- **JSON Schema as source of truth:** Edit .schema.json files for API changes, run turbo generate; never edit generated/ directly.
- **Generated files committed:** generated/ts/index.ts tracked in git so frontend can import without codegen at install time.
- **Cancellation uses threading.Event (not asyncio.Event):** is_set() is thread-safe from ThreadPoolExecutor workers; asyncio.Event is not.
- **cancel_event cleared at top of run_ocr_task:** Ensures fresh state regardless of invocation path (start, retry, retry-image).
- **StaticFiles mount after include_router:** API routes take priority; /batches-static serves data/batches/ directory.
- **Vite ws:true on /api proxy:** WebSocket upgrade for /api/v1/ws/... paths; removed unused /ws entry.

## Last Session
Stopped at: Phase 03 Plan 01 complete (backend prerequisites: results/cancel/retry-image endpoints + StaticFiles)
Resume file: .planning/phases/03-processing-results-react/03-01-SUMMARY.md

## Accumulated Context

### Roadmap Evolution
- Phase 02.1 inserted after Phase 2: add turbo (URGENT)
- Phase 02.1 Plan 01 complete: flat frontend/+backend/ migrated to apps/+packages/ Turborepo layout
- Phase 02.1 Plan 02 complete: both apps are full Turborepo workspaces with all turbo task scripts
- Phase 02.1 Plan 03 complete: packages/shared-types with JSON Schema + TypeScript codegen
- Phase 03 Plan 01 complete: backend prerequisites for Processing & Results frontend plans

### Performance Metrics
| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 02.1  | 01   | ~3min    | 3     | 53    |
| 02.1  | 02   | ~2min    | 3     | 5     |
| 02.1  | 03   | ~15min   | 2     | 10    |
| 03    | 01   | ~8min    | 2     | 5     |

## Blockers
- None.
