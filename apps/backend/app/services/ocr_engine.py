import asyncio
import base64
import io
import json
import logging
import random
import re
import threading
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Callable
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from PIL import Image
from app.core.config import settings

logger = logging.getLogger(__name__)

class OcrEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        self.api_key = api_key or settings.OPENROUTER_API_KEY
        
    def _encode_image_to_base64(self, image_path: Path, max_size: Optional[int] = 1600) -> str:
        """Kodiert ein Bild als Base64; optional vorheriges Resize."""
        if max_size:
            try:
                img = Image.open(image_path)
                img.thumbnail((max_size, max_size))
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                return base64.b64encode(buf.getvalue()).decode("utf-8")
            except Exception as e:
                logger.warning(f"Resize failed for {image_path}: {e} — fallback to raw")
        
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _extract_json_from_model_content(self, content: str) -> str:
        """Entfernt Markdown-Fences und versucht, sauberes JSON zu extrahieren."""
        content = content.strip()
        if content.startswith("```"):
            parts = content.split("```")
            for p in reversed(parts):
                if p.strip():
                    content = p.strip()
                    if content.startswith("json"):
                        content = content[4:].strip()
                    break
        if not content.startswith("{"):
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1:
                content = content[start:end+1]
        return content

    def _validate_extraction(self, parsed: dict) -> Tuple[bool, List[str]]:
        """Einfache Validierung gegen das Schema."""
        errors = []
        if not isinstance(parsed, dict):
            return False, ["Parsed object is not a dict"]
        for k in settings.FIELD_KEYS:
            if k in parsed and not isinstance(parsed[k], str):
                errors.append(f"Field {k} not a string")
        return (len(errors) == 0), errors

    def _validate_signature(self, signature: Optional[str]) -> bool:
        if not signature:
            return False
        patterns = [
            r'^Spez\.\d{1,2}\.\d{3,4}(\s+[a-z])?$',
            r'^(RTSO|RTOB|TOB)\s+\d{3,4}$'
        ]
        return any(re.match(p, signature) for p in patterns)

    def _generate_prompt(self, fields: List[str], template: Optional[str] = None) -> str:
        """Generiert einen dynamischen Prompt basierend auf den gewünschten Feldern.

        If template is provided, renders it by substituting {{fields}} with the fields block.
        If {{fields}} is not present in the template, the fields block is appended.
        If template is None, falls back to the default hardcoded German prompt.
        """
        fields_block = "\n".join([f"{i+1}. **{field}**: Extrahiere den Wert für das Feld '{field}'." for i, field in enumerate(fields)])

        if template is not None:
            if "{{fields}}" in template:
                return template.replace("{{fields}}", fields_block)
            else:
                return template + "\n\n" + fields_block

        return f"""Du bist ein Experte für die Digitalisierung historischer Archivkarteikarten.

Deine Aufgabe ist es, die Informationen von der Karteikarte präzise zu extrahieren.
Achte besonders auf die Handschrift und mögliche Streichungen.

**Extrahiere folgende Felder:**
{fields_block}

Falls ein Feld nicht auf der Karte vorhanden ist oder nicht entziffert werden kann, verwende einen leeren String ("").
Ändere nichts an der Schreibweise historischer Begriffe, außer bei offensichtlichen Tippfehlern.

**AUSGABEFORMAT:** Antworte NUR mit einem validen JSON-Objekt.
"""

    def _call_vlm_api_resilient(self, image_path: Path, fields: Optional[List[str]] = None, max_size: Optional[int] = 1600, prompt_template: Optional[str] = None) -> Tuple[Optional[Dict], Optional[str]]:
        """Resilienter API-Aufruf: Session, exponential backoff with jitter."""
        if not self.api_key:
            return None, "API Key missing"

        base64_image = self._encode_image_to_base64(image_path, max_size=max_size)
        headers = {"Authorization": f"Bearer {self.api_key}"}

        prompt = self._generate_prompt(fields, template=prompt_template) if fields else settings.EXTRACTION_PROMPT
        
        payload = {
            "model": settings.MODEL_NAME,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 1200
        }

        max_retries = settings.MAX_RETRIES
        attempt = 0
        last_error_msg = "Max retries reached"
        while attempt < max_retries:
            try:
                resp = self.session.post(settings.API_ENDPOINT, headers=headers, json=payload, timeout=120)
                if resp.status_code == 429:
                    ra = resp.headers.get("Retry-After")
                    wait = float(ra) if ra and ra.isdigit() else (2 ** attempt) + random.random()
                    logger.warning(f"Rate limit (429). Sleeping {wait:.1f}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait)
                    attempt += 1
                    continue
                # Non-retriable HTTP errors: fail fast with the actual API message
                if resp.status_code in (401, 403):
                    try:
                        body = resp.json()
                        api_msg = body.get("error", {}).get("message", resp.text[:200])
                    except Exception:
                        api_msg = resp.text[:200]
                    error = f"API error {resp.status_code}: {api_msg}"
                    logger.error(f"[{image_path.name}] {error}")
                    return None, error
                resp.raise_for_status()
                result = resp.json()
                if "choices" in result and len(result["choices"]) > 0:
                    content = result["choices"][0]["message"]["content"]
                    cleaned = self._extract_json_from_model_content(content)
                    try:
                        parsed = json.loads(cleaned)
                    except json.JSONDecodeError:
                        logger.warning(f"JSON decode failed for {image_path.name}")
                        return None, "JSONDecodeError"
                    return parsed, None
                else:
                    return None, "No choices returned by API"
            except requests.exceptions.RequestException as e:
                last_error_msg = str(e)
                wait = (2 ** attempt) + random.uniform(0, 1)
                logger.warning(f"RequestException: {e}. Retrying in {wait:.1f}s (attempt {attempt+1}/{max_retries})")
                time.sleep(wait)
                attempt += 1
            except Exception as e:
                logger.exception(f"Unexpected error in _call_vlm_api_resilient: {e}")
                return None, str(e)
        return None, f"Max retries reached: {last_error_msg}"

    def _process_card_sync(self, image_path: Path, batch_name: str, fields: Optional[List[str]] = None, max_size: Optional[int] = 1600, prompt_template: Optional[str] = None) -> Dict[str, Any]:
        """Synchronous card processing logic."""
        start_time = time.time()
        filename = image_path.name
        try:
            data, error = self._call_vlm_api_resilient(image_path, fields=fields, max_size=max_size, prompt_template=prompt_template)
            duration = time.time() - start_time
            
            if error:
                logger.error(f"[{batch_name}] {filename} -> {error}")
                return {
                    "filename": filename,
                    "batch": batch_name,
                    "success": False,
                    "error": error,
                    "duration": duration
                }
            
            # Enrich metadata
            if data is None:
                data = {}
            data["Datei"] = filename
            data["Batch"] = batch_name

            # Validation
            ok, v_errors = self._validate_extraction(data)

            return {
                "filename": filename,
                "batch": batch_name,
                "success": True,
                "data": data,
                "duration": duration,
                "has_komponist": bool(data.get("Komponist", "").strip()),
                "has_signatur": bool(data.get("Signatur", "").strip()),
                "valid_signatur": self._validate_signature(data.get("Signatur", "")),
                "validation_errors": v_errors if not ok else []
            }
        except Exception as e:
            logger.exception(f"Unexpected error processing card {filename}: {e}")
            return {
                "filename": filename,
                "batch": batch_name,
                "success": False,
                "error": str(e),
                "duration": time.time() - start_time
            }

    async def process_card(self, image_path: Path, batch_name: str, fields: Optional[List[str]] = None, max_size: Optional[int] = 1600, prompt_template: Optional[str] = None) -> Dict[str, Any]:
        """Async wrapper for process_card_sync."""
        return await asyncio.to_thread(self._process_card_sync, image_path, batch_name, fields, max_size, prompt_template)

    async def process_batch(
        self,
        batch_dir: Path,
        fields: Optional[List[str]] = None,
        max_size: Optional[int] = 1600,
        progress_callback: Optional[Callable[[str, Any], Any]] = None,
        resume: bool = True,
        cancel_event: Optional[threading.Event] = None,
        prompt_template: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Processes an entire batch of images asynchronously using a thread pool."""
        batch_name = batch_dir.name
        image_files = sorted(list(batch_dir.glob("*.jpg")) + list(batch_dir.glob("*.jpeg")))
        
        if not image_files:
            logger.warning(f"No images found in {batch_dir}")
            return []

        # Error directory
        error_dir = batch_dir / "_errors"
        error_dir.mkdir(parents=True, exist_ok=True)

        # Checkpoint handling
        checkpoint_path = batch_dir / "checkpoint.json"
        completed_files = set()
        results = []
        if resume and checkpoint_path.exists():
            try:
                with open(checkpoint_path, "r") as f:
                    checkpoint_data = json.load(f)
                    for res in checkpoint_data:
                        results.append(res)
                        if res.get("success", False):
                            completed_files.add(res["filename"])
                logger.info(f"Resuming batch {batch_name}: {len(completed_files)} already successfully processed")
            except Exception as e:
                logger.error(f"Failed to read checkpoint for {batch_name}: {e}")

        files_to_process = [f for f in image_files if f.name not in completed_files]
        if not files_to_process:
            logger.info(f"Batch {batch_name} already fully processed")
            return results

        total = len(image_files)
        start_time = time.time()
        loop = asyncio.get_running_loop()

        # Helper to update checkpoint
        def _save_checkpoint(current_results):
            try:
                with open(checkpoint_path, "w") as f:
                    json.dump(current_results, f, indent=2)
            except Exception as e:
                logger.error(f"Failed to save checkpoint for {batch_name}: {e}")

        # Use to_thread for the whole pool execution to avoid blocking the event loop
        def _run_batch():
            # 'loop' is captured from the async closure above (asyncio.get_running_loop())
            # Use a dict to track results by filename to handle replacements (retries)
            res_map = {r["filename"]: r for r in results}

            with ThreadPoolExecutor(max_workers=settings.MAX_WORKERS) as executor:
                futures = {
                    executor.submit(self._process_card_sync, img, batch_name, fields, max_size, prompt_template): img
                    for img in files_to_process
                }
                for i, fut in enumerate(as_completed(futures), len(completed_files) + 1):
                    res = fut.result()

                    # Error handling: move failed cards to _errors/
                    if not res.get("success", False):
                        img_path = futures[fut]
                        try:
                            import shutil
                            shutil.move(str(img_path), str(error_dir / img_path.name))
                            logger.info(f"Moved failed card {img_path.name} to {error_dir}")
                        except Exception as e:
                            logger.error(f"Failed to move {img_path.name} to errors: {e}")

                    res_map[res["filename"]] = res
                    current_results = list(res_map.values())
                    _save_checkpoint(current_results)

                    # Cooperative cancellation: check after each image + checkpoint save
                    if cancel_event and cancel_event.is_set():
                        logger.info(f"Batch {batch_name} cancelled by user after {i} images")
                        break

                    if progress_callback:
                        elapsed = time.time() - start_time
                        processed_count = i - len(completed_files)
                        avg_time = elapsed / processed_count if processed_count > 0 else 0
                        remaining_count = total - i
                        eta = avg_time * remaining_count
                        
                        from app.models.schemas import BatchProgress, ExtractionResult
                        
                        # Prepare progress data
                        progress_data = BatchProgress(
                            batch_name=batch_name,
                            current=i,
                            total=total,
                            percentage=round((i / total) * 100, 2),
                            eta_seconds=round(eta, 1),
                            last_result=ExtractionResult(**res),
                            status="running"
                        )
                        
                        # Call the callback via the main loop's thread-safe method if it's async
                        if asyncio.iscoroutinefunction(progress_callback):
                            asyncio.run_coroutine_threadsafe(
                                progress_callback(batch_name, progress_data),
                                loop
                            )
                        else:
                            progress_callback(batch_name, progress_data)
            return list(res_map.values())

        return await asyncio.to_thread(_run_batch)

ocr_engine = OcrEngine()
