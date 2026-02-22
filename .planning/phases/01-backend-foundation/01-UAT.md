---
status: diagnosed
phase: 01-backend-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-02-22T12:00:00Z
updated: 2026-02-22T12:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Server Starts & Health Check
expected: Running the backend launches FastAPI. GET /api/v1/health returns 200 OK with JSON body.
result: issue
reported: "{\"detail\":\"Not Found\"}"
severity: major

### 2. Upload Files via API
expected: POST /api/v1/upload with image files stores them in a session-specific temp directory under data/temp/. The response confirms successful upload with file count.
result: pass

### 3. Create Batch from Uploads
expected: POST /api/v1/batches with a batch name and field configuration moves uploaded files from temp to a permanent batch folder under data/batches/ following the [Name]_[Timestamp]_[ID] naming convention. Batch appears in batches.json history.
result: pass

### 4. Template CRUD
expected: POST /api/v1/templates creates a new field template. GET /api/v1/templates lists all templates. PUT updates, DELETE removes. Templates persist in data/templates.json across server restarts.
result: issue
reported: "Backend API works but frontend has no Save Template button — user cannot create/save templates from the UI. Also requested: show first batch image in Configure step with magnifier on hover for readability."
severity: major

### 5. WebSocket Progress Stream
expected: Connecting to ws://localhost:8000/api/v1/ws/task/{batch_id} while OCR is running streams real-time JSON messages with percentage, "X of Y" counter, ETA, and per-card results.
result: issue
reported: "WebSocket connection to ws://localhost:5173/api/v1/ws/task/{batch_id} failed: WebSocket is closed before the connection is established. Connection goes through Vite dev server (port 5173) instead of reaching backend (port 8000). React Strict Mode double-invoke tears down first connection, second also fails."
severity: blocker

### 6. Error Handling — Skip on Error
expected: If an image fails OCR processing, it is moved to an _errors/ subfolder inside the batch directory. The batch continues processing remaining images without stopping.
result: skipped
reason: Cannot test — WebSocket connection failure blocks OCR processing flow

### 7. Retry Failed Images
expected: POST /api/v1/batches/{batch_id}/retry re-processes only the images in _errors/. Successfully retried images move back to the main batch results.
result: skipped
reason: Cannot test — WebSocket connection failure blocks OCR processing flow

### 8. Batch History Persistence
expected: After creating batches, data/batches.json contains entries with batch name, status, timestamp, and file count. Data survives server restarts.
result: issue
reported: "Backend data persists correctly in batches.json, but there is no frontend UI to browse batch history — cannot review, retry, restart, or delete a former run from the app."
severity: major

## Summary

total: 8
passed: 2
issues: 4
pending: 0
skipped: 2

## Gaps

- truth: "GET /api/v1/health returns 200 OK with JSON body"
  status: failed
  reason: "User reported: {\"detail\":\"Not Found\"}"
  severity: major
  test: 1
  root_cause: "Double prefix bug — health.py defines @router.get('/health') but api.py already mounts with prefix='/health', resulting in /api/v1/health/health instead of /api/v1/health"
  artifacts:
    - path: "apps/backend/app/api/api_v1/endpoints/health.py"
      issue: "Route decorator has /health but router is already mounted at /health prefix"
    - path: "apps/backend/app/api/api_v1/api.py"
      issue: "include_router(health.router, prefix='/health') doubles the prefix"
  missing:
    - "Change health.py route from @router.get('/health') to @router.get('/') or @router.get('')"

- truth: "Template CRUD accessible from frontend UI — user can save, load, update, delete templates"
  status: failed
  reason: "User reported: Backend API works but frontend has no Save Template button. Also requested image preview with magnifier in Configure step."
  severity: major
  test: 4
  root_cause: "Frontend only implemented useTemplatesQuery (read). No create/update/delete mutations in templatesApi.ts. No Save Template button in FieldManager.tsx or ConfigureStep.tsx."
  artifacts:
    - path: "apps/frontend/src/api/templatesApi.ts"
      issue: "Only exports useTemplatesQuery — no useCreateTemplateMutation, useUpdateTemplateMutation, useDeleteTemplateMutation"
    - path: "apps/frontend/src/features/configure/FieldManager.tsx"
      issue: "Ideal location for Save as Template button — adjacent to field list summary"
    - path: "apps/frontend/src/features/configure/TemplateSelector.tsx"
      issue: "Read-only dropdown — no delete option per template"
  missing:
    - "useCreateTemplateMutation() in templatesApi.ts"
    - "useUpdateTemplateMutation() in templatesApi.ts"
    - "useDeleteTemplateMutation() in templatesApi.ts"
    - "Save as Template button in FieldManager.tsx with name dialog"
    - "First batch image preview in Configure step"
    - "Magnifier on hover for image readability"

- truth: "WebSocket streams real-time progress during OCR processing"
  status: failed
  reason: "User reported: WebSocket connection to ws://localhost:5173/api/v1/ws/task/{batch_id} failed: closed before connection established. Vite proxy not forwarding WS upgrade to backend."
  severity: blocker
  test: 5
  root_cause: "Vite proxy config has ws:true but WebSocket upgrade not properly forwarded. May need rewriteWsUpgradeUrl:true or Vite version update. Backend WS endpoint at /api/v1/ws/task/{batch_id} is correct. Frontend URL construction is correct."
  artifacts:
    - path: "apps/frontend/vite.config.ts"
      issue: "Proxy /api rule has ws:true but WS upgrade not reaching backend — needs rewriteWsUpgradeUrl:true or proxy restructure"
    - path: "apps/frontend/src/features/processing/useProcessingWebSocket.ts"
      issue: "URL construction correct (ws://host/api/v1/ws/task/{id}) — not the source of the bug"
    - path: "apps/backend/app/api/api_v1/endpoints/ws.py"
      issue: "Endpoint @router.websocket('/task/{batch_id}') correct — not the source"
  missing:
    - "Add rewriteWsUpgradeUrl:true to Vite proxy config or verify Vite version supports WS proxying"

- truth: "Batch history browsable from frontend — review, retry, restart, delete former runs"
  status: failed
  reason: "User reported: Backend data persists correctly in batches.json, but no frontend UI to browse batch history — cannot review, retry, restart, or delete a former run."
  severity: major
  test: 8
  root_cause: "No batch history UI exists anywhere in frontend. Backend has GET /api/v1/batches/ (list names) and BatchHistory schema but no detailed history endpoint. Frontend batchesApi.ts has no listBatches hook. No dashboard/history feature directory."
  artifacts:
    - path: "apps/backend/app/api/api_v1/endpoints/batches.py"
      issue: "GET / returns batch names only — no detailed history endpoint with metadata, no DELETE endpoint"
    - path: "apps/backend/app/models/schemas.py"
      issue: "BatchHistory schema exists but is unused by any endpoint"
    - path: "apps/frontend/src/api/batchesApi.ts"
      issue: "No listBatches(), getBatchHistory(), or deleteBatch() functions"
    - path: "apps/frontend/src/App.tsx"
      issue: "Only 4 wizard steps — no history/dashboard view"
  missing:
    - "GET /api/v1/batches/history endpoint returning full metadata from batches.json"
    - "DELETE /api/v1/batches/{batch_name} endpoint"
    - "listBatchHistory() and deleteBatch() in frontend batchesApi.ts"
    - "BatchHistoryDashboard component"
    - "History/dashboard navigation in app"
    - "Per-batch actions: review results, retry, delete"
