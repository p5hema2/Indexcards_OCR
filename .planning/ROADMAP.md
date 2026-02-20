# Roadmap

## Phase 1: Backend Foundation (FastAPI Integration)
- [ ] Initialize FastAPI project structure.
- [ ] Refactor `indexcard_ocr.py` for API use (separating CLI from the core engine).
- [ ] Implement API endpoint for file uploads (storing to temporary/batch folders).
- [ ] Implement API endpoint for starting OCR tasks with dynamic field configuration.
- [ ] Implement WebSocket or polling endpoint for real-time progress updates.

## Phase 2: Frontend Scaffold & Configuration (React)
- [ ] Initialize React + TypeScript + Tailwind project (Vite-based).
- [ ] Port the "Museum-Ready" design to React components.
- [ ] Implement the **Upload** step (Dropzone component).
- [ ] Implement the **Configure** step (dynamic field management).
- [ ] Connect Frontend to Backend (API integration).

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
