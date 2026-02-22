---
status: complete
phase: 01-backend-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md
started: 2026-02-22T12:00:00Z
updated: 2026-02-22T12:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

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
skipped: 0

## Gaps

- truth: "GET /api/v1/health returns 200 OK with JSON body"
  status: failed
  reason: "User reported: {\"detail\":\"Not Found\"}"
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Template CRUD accessible from frontend UI — user can save, load, update, delete templates"
  status: failed
  reason: "User reported: Backend API works but frontend has no Save Template button. Also requested image preview with magnifier in Configure step."
  severity: major
  test: 4
  root_cause: ""
  artifacts: []
  missing:
    - "Save Template button in Configure step"
    - "First batch image preview in Configure step"
    - "Magnifier on hover for image readability"
  debug_session: ""

- truth: "WebSocket streams real-time progress during OCR processing"
  status: failed
  reason: "User reported: WebSocket connection to ws://localhost:5173/api/v1/ws/task/{batch_id} failed: closed before connection established. Vite proxy not forwarding WS upgrade to backend."
  severity: blocker
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Batch history browsable from frontend — review, retry, restart, delete former runs"
  status: failed
  reason: "User reported: Backend data persists correctly in batches.json, but no frontend UI to browse batch history — cannot review, retry, restart, or delete a former run."
  severity: major
  test: 8
  root_cause: ""
  artifacts: []
  missing:
    - "Batch history list/dashboard in frontend"
    - "Actions per batch: review, retry, restart, delete"
  debug_session: ""
