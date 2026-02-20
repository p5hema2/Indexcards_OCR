# Requirements

## Functional Requirements

### FR1: Image Upload (Drag & Drop)
- [ ] Users can upload single or multiple JPG/JPEG images of index cards.
- [ ] Users can remove uploaded files before processing.
- [ ] Support for large batches (at least 100 images per session).

### FR2: Metadata Field Configuration
- [ ] Users can define a list of fields to be extracted (e.g., Inventory No, Object Name, Date).
- [ ] Field names will dynamically update the VLM prompt.
- [ ] Ability to enable/disable or delete predefined/custom fields.

### FR3: OCR Processing & Progress Tracking
- [ ] Backend must process images using the Qwen3-VL model via OpenRouter.
- [ ] Real-time progress updates (percentage completed) shown in the GUI.
- [ ] Resilient handling of API rate limits and errors (inherited from `indexcard_ocr.py`).

### FR4: Results Visualization & Export
- [ ] Summary of results shown after processing (Success/Fail counts, duration).
- [ ] Ability to download the extracted data as a CSV file.
- [ ] CSV format must be compatible with collection management systems (UTF-8 with BOM for Excel compatibility).

### FR5: Local Storage / Persistence
- [ ] Processing results and logs should be stored locally (e.g., in `output_batches/`).

## Non-Functional Requirements

### NFR1: Performance
- [ ] Multi-threaded processing on the backend for faster extraction.
- [ ] Optional image resizing before upload to reduce API latency and cost.

### NFR2: Usability
- [ ] Responsive web interface matching the "Museum-Ready" prototype aesthetic.
- [ ] Clear error messaging for failed API calls or invalid images.

### NFR3: Security
- [ ] API keys should be handled via environment variables (`.env`).
- [ ] The web server should run locally by default (for privacy-conscious institutions).

### NFR4: Maintainability
- [ ] Modular architecture separating the OCR engine logic from the web API.
- [ ] Clear documentation on how to update fields or prompts.
