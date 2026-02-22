# Roadmap

## Phase 1: Backend Foundation (FastAPI Integration)
**Goal:** Implementation of the modular FastAPI service, WebSocket progress tracking, and batch/upload lifecycle logic.
**Plans:** 9 plans
- [x] 01-01-PLAN.md — Core architecture and modularized OcrEngine service.
- [x] 01-02-PLAN.md — Batch lifecycle management, Upload API, and reusable field templates.
- [x] 01-03-PLAN.md — Real-time progress updates via WebSockets and resilient error recovery.
- [x] 01-04-PLAN.md — Gap closure: fix health endpoint double prefix and WebSocket proxy.
- [x] 01-05-PLAN.md — Gap closure: template save/delete UI and image preview with magnifier.
- [x] 01-06-PLAN.md — Gap closure: batch history backend endpoints and frontend dashboard.
- [x] 01-07-PLAN.md — Gap closure: fix asyncio event loop bug + silent failure (BLOCKER).
- [x] 01-08-PLAN.md — Gap closure: temp session cleanup to prevent server pollution (MAJOR).
- [x] 01-09-PLAN.md — Gap closure: larger image preview and magnifier for A5 cards (MINOR).

**Requirements:**
- [x] [BACKEND-01] Initialize FastAPI project structure (app, models, services).
- [x] [BACKEND-02] Refactor `indexcard_ocr.py` into a modular `OcrEngine` class.
- [x] [BACKEND-03] Implement Upload API with Temp-to-Perm lifecycle and naming conventions.
- [x] [BACKEND-04] Implement Batch configuration and Template management.
- [x] [BACKEND-05] Implement WebSocket progress tracking (%, X/Y, ETA, live streaming).
- [x] [BACKEND-06] Implement Error Handling & Recovery (skip-on-error, _errors/ folder).
- [x] [BACKEND-07] Implement Batch History and Resume/Retry functionality.

## Phase 2: Frontend Scaffold & Configuration (React)
**Goal:** Initialize the React frontend, port the "Museum-Ready" design, and implement the Upload/Configure workflow.
**Plans:** 5 plans
- [x] 02-01-PLAN.md — Frontend Foundation & Global Shell.
- [x] 02-02-PLAN.md — Step 1: Upload Workflow & API.
- [x] 02-03-PLAN.md — Step 2: Configuration & Field Management.
- [x] 02-04-PLAN.md — Gap closure: sidebar back-navigation to completed steps.
- [x] 02-05-PLAN.md — Gap closure: sticky floating WizardNav bar for always-visible navigation.

**Requirements:**
- [x] [FRONTEND-01] Initialize React + TypeScript + Tailwind project (Vite-based).
- [x] [FRONTEND-02] Port the "Museum-Ready" design (Parchment theme) to React components.
- [x] [FRONTEND-03] Implement the **Upload** step (Dropzone component + List View).
- [x] [FRONTEND-04] Implement the **Configure** step (dynamic field management + templates).
- [x] [FRONTEND-05] Connect Frontend to Backend (API integration via TanStack Query).

### Phase 02.1: add turbo (INSERTED)

**Goal:** Set up Turborepo monorepo with unified dev commands, migrate to apps/ + packages/ convention, create shared types package with cross-language codegen.
**Depends on:** Phase 2
**Plans:** 3/3 plans complete

Plans:
- [ ] 02.1-01-PLAN.md — Directory restructure (git mv), root package.json + turbo.json, .env path fixes.
- [ ] 02.1-02-PLAN.md — Backend thin package.json wrapper, frontend workspace updates, root setup script.
- [ ] 02.1-03-PLAN.md — Shared types package with JSON Schema codegen (TypeScript + Pydantic).

## Phase 3: Processing & Results (React)
**Goal:** Wire the Processing step to the backend OCR engine via WebSocket with real-time progress and live feed, then display results in an editable data table with summary stats, image thumbnails, retry capability, and CSV/JSON export.
**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Backend gaps: cancel support, results/cancel/retry-image endpoints, StaticFiles mount.
- [ ] 03-02-PLAN.md — Processing step: Zustand extension, WebSocket hook, ProgressBar, LiveFeed, cancel, catastrophic failure detection.
- [ ] 03-03-PLAN.md — Results step: TanStack sortable/editable table, thumbnails with lightbox, retry, CSV/JSON export.

### Phase 03.1: Dynamic prompt generation from field definitions with configurable prompt template (INSERTED)

**Goal:** Add an optional `prompt_template` field to templates and batches, wire it through the backend OCR pipeline with `{{fields}}` placeholder substitution, and surface a collapsible prompt editor with live preview in the Configure step UI.
**Depends on:** Phase 3
**Plans:** 3/3 plans complete

Plans:
- [x] 03.1-01-PLAN.md — Schema + codegen + Pydantic models + backend pipeline wiring (batch_manager, ocr_engine, batches endpoint).
- [x] 03.1-02-PLAN.md — Frontend: Zustand store, API layers, PromptTemplateEditor component, ConfigureStep/TemplateSelector/FieldManager integration.
- [ ] 03.1-03-PLAN.md — Gap closure: domain-agnostic default prompt + template save persists prompt_template.

## Phase 4: Refinement & Polish
- [ ] Enhance error handling in the GUI (e.g., failed images list).
- [ ] Optimize image resizing logic in the backend.
- [ ] Ensure local persistence for batch history.
- [ ] Final E2E testing of the "Museum-Ready" workflow.

## Phase 5: Advanced Domain Research & Features
- [ ] Research historical handwriting/notations and update the default prompt.
- [ ] Research technical optimizations for VLM (e.g., better image quality vs. cost).
- [ ] Support for additional output formats (JSON-LD, XML).
- [ ] Packaging for local deployment (Docker or portable executable).
