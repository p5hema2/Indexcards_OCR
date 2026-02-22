# Project State

## Current Phase
Phase 03.1: Dynamic Prompt Generation from Field Definitions with Configurable Prompt Template

## Current Plan
Plan 02 complete (PromptTemplateEditor UI + full frontend data flow wiring). Phase 03.1 fully complete. Ready for UAT.

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
- [x] Phase 03 Plan 02: Processing step (React): WebSocket, ProgressBar, LiveFeed, cancel, catastrophic failure.
- [x] Phase 03 Plan 03: Results step (React): sortable/editable table, thumbnails, lightbox, CSV/JSON export.
- [x] Phase 01 Plan 04 (gap closure): Fixed health endpoint double-prefix bug and Vite WS proxy for UAT tests 1 and 5.
- [x] Phase 01 Plan 05 (gap closure): Template Save/Delete UI + ImagePreview with magnifier for UAT test 4.
- [x] Phase 01 Plan 06 (gap closure): Batch History Dashboard — GET /history, DELETE /{name}, BatchHistoryDashboard + BatchHistoryCard, AppView routing.
- [x] Phase 01 Plan 09 (gap closure): Image preview 200px magnifier at 3.5x zoom, 500px max-height for A5 cards.
- [x] Phase 01 Plan 08 (gap closure): Temp session cleanup — startup stale removal + DELETE /upload/{session_id}.
- [x] Phase 01 Plan 07 (gap closure): BLOCKER fix — asyncio event loop capture + silent failure broadcast in batches.py.
- [x] Phase 02 Plan 04 (gap closure): Sidebar back-navigation to completed steps.
- [x] Phase 02 Plan 05 (gap closure): WizardNav sticky bottom navigation bar on Upload, Configure, Results steps.

## Active Tasks
- Phase 02.1 fully verified (UAT 7/7 passed, 1 issue fixed inline). Ready to proceed to Phase 03 verification or Phase 4 planning.

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
- **Native WebSocket (not react-use-websocket):** avoids React 19 flushSync incompatibility; no new dependency.
- **WebSocket onMessage as callback (not hook state):** hook dispatches directly to Zustand; no re-renders on every WS message.
- **Zustand partialize excludes processingState/results:** prevents localStorage cell-edit performance regression.
- **3-strike catastrophic failure:** closes WS + best-effort cancel + full-screen troubleshooting screen; user returns to configure.
- **Hydrate results from REST (not WS stream):** GET /batches/{name}/results is authoritative; WS can have gaps from reconnects.
- **hydratedRef guard in ResultsStep:** prevents double setResults on React Strict Mode double-invoke.
- **Merge editedData on results hydration:** fresh API data overwrites data fields but editedData map is preserved within session.
- **Tailwind JIT status color lookup map:** static statusStyles object instead of template literals to avoid JIT purge.
- **retryImage navigates to processing step:** single-image retry starts new WS stream; retryBatch used for bulk retry (POST /retry).
- **FastAPI route ordering: /history before /{batch_name}:** path parameters match greedily; static segments must be registered first.
- **AppView in Zustand (wizard|history):** top-level view switch enables history dashboard without a React Router dependency; view persisted in localStorage.
- **loadBatchForReview sets batchId+step+view atomically:** ResultsStep uses existing useResultsQuery(batchId) to hydrate — no new API wiring needed.
- **delete_batch checks disk AND history file:** batch found in either location counts as found; both cleaned up if present.
- **FastAPI router prefix pattern:** include_router(router, prefix='/x') + @router.get('/') resolves to /x (not /x/x); decorator must be '/' not the route name.
- **Vite 7 WS proxy:** rewriteWsOrigin:true required in addition to changeOrigin:true for WebSocket upgrade origin rewriting (http-proxy-3 behaviour).
- **Custom div dropdown for TemplateSelector:** HTML <select> cannot render custom markup inside <option>, so refactored to div-based dropdown with per-row Trash2 delete button.
- **Magnifier uses pure CSS/JS (no library):** Overlaid scaled <img> positioned from cursor's relative x/y in container; 200px lens, 3.5x zoom factor.
- **ImagePreview reads blob URL from Zustand:** Temp session files are not served by StaticFiles; blob URLs created during upload step via URL.createObjectURL. Falls back to placeholder text if undefined.
- **Event loop closure capture for thread-safe WS callbacks:** asyncio.get_running_loop() in async method, closure variable used by worker thread's run_coroutine_threadsafe.
- **Defensive broadcast on all exit paths:** run_ocr_task creates fallback BatchProgress(current=0, total=0) when last_state is None.
- **Modern FastAPI lifespan over deprecated on_event:** asynccontextmanager lifespan is the recommended pattern; on_event("startup") is deprecated.
- **24-hour default for stale session cleanup:** configurable via max_age_hours parameter; runs on every server startup.
- **Sidebar step clickability guard in component (not store):** handleStepClick in Sidebar guards processing/results from sidebar navigation; setStep in store remains unrestricted so loadBatchForReview and other callers work freely.
- **WizardNav uses sticky bottom-0 (not fixed):** nav bar stays within main scroll container and does not overlap the Footer; ProcessingStep excluded from WizardNav.
- **prompt_template uses {{fields}} substitution with append fallback:** if placeholder absent in template, fields block appended after two newlines; null/absent means existing hardcoded German prompt.
- **prompt_template read via config.get() in run_ocr_task:** backward compatibility with existing config.json files that lack the key — no migration required.
- **process_batch prompt_template at end of signature:** avoids breaking existing callers that use positional args for earlier parameters.
- **DEFAULT_TEMPLATE in PromptTemplateEditor matches ocr_engine.py exactly:** null sentinel correctly identifies when user has reset to default; no duplicate string stored.
- **PromptTemplateEditor collapsed by default:** non-intrusive for users who don't need prompt customization; power-user feature discoverable via expand toggle.
- **null-means-default pattern throughout:** null in Zustand store = backend uses its own hardcoded German prompt; non-null = custom override sent via API.

## Last Session
Stopped at: Completed Phase 03.1 Plan 02 — PromptTemplateEditor UI + full frontend prompt_template data flow
Resume file: .planning/STATE.md
Timestamp: 2026-02-22T15:39:00Z

## Accumulated Context

### Roadmap Evolution
- Phase 02.1 inserted after Phase 2: add turbo (URGENT)
- Phase 02.1 Plan 01 complete: flat frontend/+backend/ migrated to apps/+packages/ Turborepo layout
- Phase 02.1 Plan 02 complete: both apps are full Turborepo workspaces with all turbo task scripts
- Phase 02.1 Plan 03 complete: packages/shared-types with JSON Schema + TypeScript codegen
- Phase 03 Plan 01 complete: backend prerequisites for Processing & Results frontend plans
- Phase 03 Plan 02 complete: ProcessingStep with native WebSocket, ProgressBar, LiveFeed, cancel, 3-strike catastrophic failure, Zustand partialize
- Phase 03 Plan 03 complete: ResultsStep with TanStack Table, editable cells, YARL thumbnails, CSV/JSON export — full wizard end-to-end
- Phase 01 Plan 04 (gap closure) complete: fixed health endpoint double-prefix (/health/health -> /health) and added rewriteWsOrigin:true to Vite proxy for WS upgrade forwarding
- Phase 01 Plan 05 (gap closure) complete: template save/delete UI (SaveTemplateDialog, custom TemplateSelector dropdown, FieldManager Save button) + ImagePreview with 2.5x magnifier in Configure step sidebar
- Phase 01 Plan 06 (gap closure) complete: GET /history + DELETE /{name} backend endpoints, BatchHistoryDashboard React component, AppView Zustand state, sidebar/header navigation
- Phase 01 Plan 09 (gap closure) complete: image preview 200px magnifier at 3.5x zoom, 500px max-height for A5 index card readability
- Phase 01 Plan 08 (gap closure) complete: startup stale session cleanup (24h threshold) + DELETE /upload/{session_id} endpoint for explicit frontend teardown
- Phase 01 Plan 07 (gap closure) complete: BLOCKER fix — asyncio event loop capture in async context + fallback BatchProgress broadcast on all exit paths
- Phase 02 Plan 04 (gap closure) complete: Sidebar clickability enabled for completed steps; handleStepClick guard in Sidebar.tsx; setStep in store remains unrestricted
- Phase 02 Plan 05 (gap closure) complete: WizardNav sticky bottom nav component; inline buttons removed from Upload, Configure, Results steps; ProcessingStep unchanged
- Phase 03.1 inserted after Phase 3: Dynamic prompt generation from field definitions with configurable prompt template (URGENT)
- Phase 03.1 Plan 01 complete: prompt_template added to all 5 data model types (schema, TS, Python, Pydantic) and wired end-to-end through OCR pipeline with {{fields}} substitution and backward-compat fallback.
- Phase 03.1 Plan 02 complete: PromptTemplateEditor React component with live preview, Zustand promptTemplate state, prompt_template wired through all frontend API calls (template save/load + batch creation).

### Performance Metrics
| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 02.1  | 01   | ~3min    | 3     | 53    |
| 02.1  | 02   | ~2min    | 3     | 5     |
| 02.1  | 03   | ~15min   | 2     | 10    |
| 03    | 01   | ~8min    | 2     | 5     |
| 03    | 02   | ~2min    | 2     | 7     |
| 03    | 03   | ~3min    | 2     | 7     |
| 01    | 04   | ~5min    | 1     | 2     |
| 01    | 05   | ~2min    | 2     | 6     |
| 01    | 06   | ~5min    | 2     | 9     |
| 01    | 09   | <1min    | 1     | 1     |
| 01    | 08   | ~2min    | 2     | 3     |
| 01    | 07   | ~2min    | 2     | 2     |
| 02    | 04   | ~2min    | 1     | 1     |
| 02    | 05   | ~5min    | 2     | 4     |
| 03.1  | 01   | ~4min    | 2     | 9     |
| 03.1  | 02   | ~5min    | 2     | 7     |

## Blockers
- None.
