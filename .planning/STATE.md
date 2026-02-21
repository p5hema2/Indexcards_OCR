# Project State

## Current Phase
Phase 02.1: Add Turbo (Turborepo Monorepo Migration)

## Current Plan
02.1-02: Backend package.json wrapper

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

## Active Tasks
- [ ] Execute Phase 02.1 Plan 02: Backend package.json wrapper.
- [ ] Execute Phase 02.1 Plan 03: Shared types package setup.
- [ ] Execute Phase 3: Processing & Results (React).

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

## Last Session
Stopped at: Phase 02.1 Plan 01 complete (Turborepo monorepo migration committed as 1847290)
Resume file: .planning/phases/02.1-add-turbo/02.1-01-SUMMARY.md

## Accumulated Context

### Roadmap Evolution
- Phase 02.1 inserted after Phase 2: add turbo (URGENT)
- Phase 02.1 Plan 01 complete: flat frontend/+backend/ migrated to apps/+packages/ Turborepo layout

### Performance Metrics
| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 02.1  | 01   | ~3min    | 3     | 53    |

## Blockers
- None.
