---
status: complete
phase: 01-backend-foundation
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md, 01-05-SUMMARY.md, 01-06-SUMMARY.md
started: 2026-02-22T14:00:00Z
updated: 2026-02-22T15:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Health Check Endpoint
expected: GET /api/v1/health returns 200 OK with JSON body {"status":"OK","version":"0.1.0"}. The old double-prefix path /api/v1/health/health returns 404.
result: pass

### 2. Upload Files via API
expected: POST /api/v1/upload with image files stores them in a session-specific temp directory under data/temp/. The response confirms successful upload with file count.
result: pass

### 3. Create Batch from Uploads
expected: POST /api/v1/batches with a batch name and field configuration moves uploaded files from temp to a permanent batch folder under data/batches/ following the [Name]_[Timestamp]_[ID] naming convention. Batch appears in batches.json history.
result: issue
reported: "a batch should be created upon upload, or the server will be poluted. you are not able to delete old images"
severity: major

### 4. Save Template from Frontend
expected: In the Configure step, clicking "Save as Template" opens a dialog where you enter a name. After saving, the template appears in the TemplateSelector dropdown. The template persists via POST /api/v1/templates.
result: pass

### 5. Delete Template from Frontend
expected: In the TemplateSelector custom dropdown, each user-created template has a trash icon. Clicking it deletes the template (DELETE /api/v1/templates/{id}) and the list auto-refreshes.
result: pass

### 6. Image Preview with Magnifier
expected: In the Configure step sidebar, when images have been uploaded, the first image is displayed as a preview card. Hovering over the image shows a circular magnifier lens (2.5x zoom) that follows the cursor.
result: issue
reported: "works but the sample card preview is too small and the magnifying as well, imagine that the cards we scan are A5 with very fine text."
severity: minor

### 7. WebSocket Progress Stream
expected: Connecting to ws://localhost:5173/api/v1/ws/task/{batch_id} (through Vite proxy) while OCR is running streams real-time JSON messages with percentage, "X of Y" counter, ETA, and per-card results. The Vite proxy correctly forwards WebSocket upgrades to the backend.
result: issue
reported: "WebSocket connects (both direct and proxy confirmed OPEN via manual test) but receives zero messages. OCR background task never produces results — no checkpoint.json created. Root cause: asyncio.get_event_loop() on line 263 of ocr_engine.py is called inside asyncio.to_thread() which runs in a worker thread — gets wrong/dead event loop, so asyncio.run_coroutine_threadsafe(callback, loop) never executes. Additionally, run_ocr_task in batches.py silently swallows the error when last_state is None (no progress ever broadcast)."
severity: blocker

### 8. Error Handling — Skip on Error
expected: If an image fails OCR processing, it is moved to an _errors/ subfolder inside the batch directory. The batch continues processing remaining images without stopping.
result: skipped
reason: Cannot test — OCR processing never runs due to event loop bug (test 7)

### 9. Retry Failed Images
expected: POST /api/v1/batches/{batch_id}/retry re-processes only the images in _errors/. Successfully retried images move back to the main batch results.
result: skipped
reason: Cannot test — OCR processing never runs due to event loop bug (test 7)

### 10. Batch History Dashboard
expected: Clicking "Batch Archive" in the sidebar or header navigates to a dashboard showing all past batches. Each batch card displays name, date, file count, status badge, and error count. The dashboard loads data from GET /api/v1/batches/history.
result: pass

### 11. Batch Delete from Dashboard
expected: Each batch card has a Delete button. Clicking it removes the batch from disk and history (DELETE /api/v1/batches/{name}). The card disappears from the dashboard.
result: pass

### 12. Batch Review from Dashboard
expected: Clicking "Review Results" on a completed batch card navigates to the Results step showing that batch's data. The wizard loads the correct batch by name.
result: pass

## Summary

total: 12
passed: 7
issues: 3
pending: 0
skipped: 2

## Gaps

- truth: "Temp files cleaned up or batch created at upload to prevent server pollution"
  status: failed
  reason: "User reported: a batch should be created upon upload, or the server will be poluted. you are not able to delete old images"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Image preview and magnifier sized appropriately for A5 index cards with fine text"
  status: failed
  reason: "User reported: works but the sample card preview is too small and the magnifying as well, imagine that the cards we scan are A5 with very fine text."
  severity: minor
  test: 6
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "WebSocket streams real-time progress during OCR processing"
  status: failed
  reason: "WebSocket connects but receives zero messages. OCR background task never broadcasts progress. asyncio.get_event_loop() inside asyncio.to_thread gets wrong loop; run_ocr_task silently swallows errors when last_state is None."
  severity: blocker
  test: 7
  root_cause: "ocr_engine.py:263 asyncio.get_event_loop() called inside asyncio.to_thread worker thread — returns dead/wrong event loop. asyncio.run_coroutine_threadsafe(callback, loop) on line 316 schedules on dead loop, callback never fires. Additionally batches.py:59-64 checks last_state which is None (no broadcast ever happened), so error is silently swallowed."
  artifacts:
    - path: "apps/backend/app/services/ocr_engine.py"
      issue: "Line 263: asyncio.get_event_loop() inside thread — must capture loop in async context before to_thread"
    - path: "apps/backend/app/api/api_v1/endpoints/batches.py"
      issue: "Lines 59-64: silent failure when last_state is None — should broadcast failed status even without prior progress"
  missing:
    - "Capture event loop via asyncio.get_running_loop() in async process_batch before calling asyncio.to_thread"
    - "In run_ocr_task exception handler, create a minimal BatchProgress with status='failed' when last_state is None"
  debug_session: ""
