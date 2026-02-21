# Roadmap

## Phase 1: Backend Foundation (FastAPI Integration)
**Goal:** Implementation of the modular FastAPI service, WebSocket progress tracking, and batch/upload lifecycle logic.
**Plans:** 3 plans
- [x] 01-01-PLAN.md — Core architecture and modularized OcrEngine service.
- [x] 01-02-PLAN.md — Batch lifecycle management, Upload API, and reusable field templates.
- [x] 01-03-PLAN.md — Real-time progress updates via WebSockets and resilient error recovery.

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
**Plans:** 3 plans
- [x] 02-01-PLAN.md — Frontend Foundation & Global Shell.
- [x] 02-02-PLAN.md — Step 1: Upload Workflow & API.
- [x] 02-03-PLAN.md — Step 2: Configuration & Field Management.

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
- [ ] Implement the **Processing** step with a dynamic progress bar.
- [ ] Connect the progress bar to the Backend (WebSocket/Polling).
- [ ] Implement the **Results** step (summary view, success/error stats).
- [ ] Add the **CSV Download** feature using Backend-generated files.

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
