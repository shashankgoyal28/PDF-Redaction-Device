from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from modules.pdf_extractor import extract_text_from_bytes, extract_text_from_file
from modules.pii_detector import detect_pii
from modules.redactor import apply_redaction

import fitz  
import os
import uuid

router = APIRouter()

OUTPUT_DIR = "redacted_pdfs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


class RedactTextRequest(BaseModel):
    text: str
    redact_emails: bool = True
    redact_phones: bool = True
    redact_names: bool = False
    redact_addresses: bool = False
    label_style: str = "typed"
    custom_label: Optional[str] = None


class RedactFromPathRequest(BaseModel):
    path: str
    options: Optional[dict] = None

@router.post("/redact-text")
async def redact_text(payload: RedactTextRequest):
    text = payload.text or ""
    entities = detect_pii(text)

    allowed = {
        k for k, v in {
            "EMAIL": payload.redact_emails,
            "PHONE": payload.redact_phones,
            "NAME": payload.redact_names,
            "ADDRESS": payload.redact_addresses
        }.items() if v
    }

    entities = [e for e in entities if e["type"] in allowed]

    redacted_text, items = apply_redaction(
        text, entities, payload.label_style, payload.custom_label
    )

    counts = {}
    for it in items:
        counts[it["type"]] = counts.get(it["type"], 0) + 1

    return {
        "original_text": text,
        "redacted_text": redacted_text,
        "summary": {
            "counts": counts,
            "items": items
        }
    }

@router.post("/redact-file")
async def redact_file(
    file: UploadFile = File(...),
    redact_emails: bool = Form(True),
    redact_phones: bool = Form(True),
    redact_names: bool = Form(False),
    redact_addresses: bool = Form(False),
    label_style: str = Form("typed"),
    custom_label: Optional[str] = Form(None),
):

    if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
        raise HTTPException(415, "Only PDF, PNG or JPEG supported right now.")


    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(400, "Uploaded file is empty or could not be read.")

    base_input = f"{OUTPUT_DIR}/{uuid.uuid4()}_input"
    if file.filename and "." in file.filename:
        ext = file.filename.split(".")[-1]
        input_path = f"{base_input}.{ext}"
    else:
        input_path = f"{base_input}.pdf" if file.content_type == "application/pdf" else f"{base_input}.bin"

    try:
        with open(input_path, "wb") as f:
            f.write(raw_bytes)
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to save uploaded file: {e}")

    try:
        text = extract_text_from_bytes(raw_bytes, content_type=file.content_type, filename=file.filename)
    except Exception as e:
        
        raise HTTPException(400, detail=f"Text extraction failed: {e}")

    entities = detect_pii(text)

    allowed = {
        k for k, v in {
            "EMAIL": redact_emails,
            "PHONE": redact_phones,
            "NAME": redact_names,
            "ADDRESS": redact_addresses
        }.items() if v
    }
    entities = [e for e in entities if e["type"] in allowed]

    redacted_text, items = apply_redaction(text, entities, label_style, custom_label)


    output_path = input_path  
    if file.content_type == "application/pdf":
        try:
            doc = fitz.open(input_path)
            for page in doc:
         
                for item in items:
                    original = item["original"]
                    label = item["label"]
                    try:
                        rects = page.search_for(original)
                    except Exception:
                        rects = []
                    for inst in rects:
                        page.add_redact_annot(inst, fill=(0, 0, 0))
                        if label:
                     
                            page.insert_text((inst.x0, inst.y0 - 8), label, color=(1, 1, 1))
                page.apply_redactions()
            output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
            doc.save(output_path)
            doc.close()
        except Exception as e:
            raise HTTPException(500, detail=f"PDF redaction failed: {e}")
    else:
        try:
            img_doc = fitz.open()
            img_doc.new_page()  
            page = img_doc[0]
            page.insert_image(page.rect, stream=raw_bytes)
            output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
            img_doc.save(output_path)
            img_doc.close()
        except Exception:
            output_path = input_path

    counts = {}
    for it in items:
        counts[it["type"]] = counts.get(it["type"], 0) + 1

    return {
        "message": "File redacted successfully",
        "download_url": f"/api/download/{os.path.basename(output_path)}",
        "summary": {
            "counts": counts,
            "items": items
        },
        "original_text": text,
        "redacted_text": redacted_text
    }

@router.post("/redact-from-path")
async def redact_from_path(payload: RedactFromPathRequest):
    """
    Accepts JSON { path: string, options?: {...} } where path is a server-local path the server can access.
    This endpoint must be used only in controlled/dev environments.
    """
    path = payload.path
    if not os.path.exists(path):
        raise HTTPException(404, detail="Path not found on server")

    try:
        with open(path, "rb") as f:
            raw_bytes = f.read()
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to read server file: {e}")

    try:
        text = extract_text_from_bytes(raw_bytes, content_type=None, filename=path)
    except Exception as e:
        raise HTTPException(400, detail=f"Text extraction failed for server file: {e}")

    options = payload.options or {}
    redact_emails = options.get("redact_emails", True)
    redact_phones = options.get("redact_phones", True)
    redact_names = options.get("redact_names", False)
    redact_addresses = options.get("redact_addresses", False)
    label_style = options.get("label_style", "typed")
    custom_label = options.get("custom_label")

    entities = detect_pii(text)
    allowed = {
        k for k, v in {
            "EMAIL": redact_emails,
            "PHONE": redact_phones,
            "NAME": redact_names,
            "ADDRESS": redact_addresses
        }.items() if v
    }
    entities = [e for e in entities if e["type"] in allowed]
    redacted_text, items = apply_redaction(text, entities, label_style, custom_label)

    try:
        img_doc = fitz.open()
        img_doc.new_page()
        page = img_doc[0]
        page.insert_image(page.rect, stream=raw_bytes)
        output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
        img_doc.save(output_path)
        img_doc.close()
    except Exception:
        output_path = path

    counts = {}
    for it in items:
        counts[it["type"]] = counts.get(it["type"], 0) + 1

    return {
        "message": "Server-path file redacted",
        "download_url": f"/api/download/{os.path.basename(output_path)}",
        "summary": {"counts": counts, "items": items},
        "original_text": text,
        "redacted_text": redacted_text
    }

@router.get("/download/{filename}")
async def download_file(filename: str):
    file_path = f"{OUTPUT_DIR}/{filename}"
    if not os.path.exists(file_path):
        raise HTTPException(404, "File not found")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename
    )
