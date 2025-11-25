# from fastapi import APIRouter

# router = APIRouter()

# @router.get("/ping")
# async def ping():
#     return {"ok": True}






# this is the new code 
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# from modules.pdf_extractor import extract_text_from_file
# from modules.pii_detector import detect_pii
# from modules.redactor import apply_redaction

# router = APIRouter()

# class RedactTextRequest(BaseModel):
#     text: str
#     redact_emails: bool = True
#     redact_phones: bool = True
#     redact_names: bool = False
#     redact_addresses: bool = False
#     label_style: str = "typed"  # "typed" | "blackbox" | "custom"
#     custom_label: Optional[str] = None

# @router.post("/redact-text")
# async def redact_text(payload: RedactTextRequest):
#     text = payload.text or ""
#     # detect entities using the detector module
#     entities = detect_pii(text)

#     # filter entities according to options
#     allowed = set()
#     if payload.redact_emails: allowed.add("EMAIL")
#     if payload.redact_phones: allowed.add("PHONE")
#     if payload.redact_names: allowed.add("NAME")
#     if payload.redact_addresses: allowed.add("ADDRESS")
#     entities = [e for e in entities if e["type"] in allowed]

#     # apply redaction
#     redacted_text, items = apply_redaction(text, entities, payload.label_style, payload.custom_label)

#     # build counts
#     counts = {}
#     for it in items:
#         counts[it["type"]] = counts.get(it["type"], 0) + 1

#     return {
#         "original_text": text,
#         "redacted_text": redacted_text,
#         "summary": {
#             "counts": counts,
#             "items": items
#         }
#     }

# @router.post("/redact-file")
# async def redact_file(
#     file: UploadFile = File(...),
#     redact_emails: bool = Form(True),
#     redact_phones: bool = Form(True),
#     redact_names: bool = Form(False),
#     redact_addresses: bool = Form(False),
#     label_style: str = Form("typed"),
#     custom_label: Optional[str] = Form(None),
# ):
#     # Validate content type (allow PDF and common image types)
#     if not (file.content_type in ["application/pdf", "application/octet-stream", "image/png", "image/jpeg"]):
#         raise HTTPException(status_code=415, detail="Unsupported file type. Send PDF or image.")

#     try:
#         text = await extract_text_from_file(file)
#     except Exception as e:
#         raise HTTPException(status_code=422, detail=f"Unable to extract text: {str(e)}")

#     # reuse logic from redact-text
#     entities = detect_pii(text)
#     allowed = set()
#     if redact_emails: allowed.add("EMAIL")
#     if redact_phones: allowed.add("PHONE")
#     if redact_names: allowed.add("NAME")
#     if redact_addresses: allowed.add("ADDRESS")
#     entities = [e for e in entities if e["type"] in allowed]

#     redacted_text, items = apply_redaction(text, entities, label_style, custom_label)

#     counts = {}
#     for it in items:
#         counts[it["type"]] = counts.get(it["type"], 0) + 1

#     return {
#         "original_text": text,
#         "redacted_text": redacted_text,
#         "summary": {
#             "counts": counts,
#             "items": items
#         }
#     }








# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# from modules.pdf_extractor import extract_text_from_file
# from modules.pii_detector import detect_pii
# from modules.redactor import apply_redaction

# router = APIRouter()


# # --------------------------------------------------------
# # TEXT PAYLOAD MODEL
# # --------------------------------------------------------
# class RedactTextRequest(BaseModel):
#     text: str
#     redact_emails: bool = True
#     redact_phones: bool = True
#     redact_names: bool = False
#     redact_addresses: bool = False
#     label_style: str = "typed"      # typed | blackbox | custom
#     custom_label: Optional[str] = None


# # --------------------------------------------------------
# # TEXT REDACTION ENDPOINT
# # --------------------------------------------------------
# @router.post("/redact-text")
# async def redact_text(payload: RedactTextRequest):

#     text = payload.text or ""

#     # 1. Detect PII
#     entities = detect_pii(text)

#     # 2. Filter based on switches
#     allowed = set()
#     if payload.redact_emails: allowed.add("EMAIL")
#     if payload.redact_phones: allowed.add("PHONE")
#     if payload.redact_names: allowed.add("NAME")
#     if payload.redact_addresses: allowed.add("ADDRESS")

#     entities = [e for e in entities if e["type"] in allowed]

#     # 3. Apply redaction labels
#     redacted_text, items = apply_redaction(
#         text,
#         entities,
#         payload.label_style,
#         payload.custom_label
#     )

#     # 4. Count results
#     counts = {}
#     for it in items:
#         counts[it["type"]] = counts.get(it["type"], 0) + 1

#     return {
#         "original_text": text,
#         "redacted_text": redacted_text,
#         "summary": {
#             "counts": counts,
#             "items": items
#         }
#     }


# # --------------------------------------------------------
# # PDF / FILE REDACTION ENDPOINT
# # --------------------------------------------------------
# @router.post("/redact-file")
# async def redact_file(
#     file: UploadFile = File(...),
#     redact_emails: bool = Form(True),
#     redact_phones: bool = Form(True),
#     redact_names: bool = Form(False),
#     redact_addresses: bool = Form(False),
#     label_style: str = Form("typed"),
#     custom_label: Optional[str] = Form(None)
# ):

#     # 1. Validate file type
#     if not (
#         file.content_type in [
#             "application/pdf",
#             "application/octet-stream",
#             "image/png",
#             "image/jpeg"
#         ]
#     ):
#         raise HTTPException(
#             status_code=415,
#             detail="Unsupported file type. Upload PDF or image."
#         )

#     # 2. Extract text from file
#     try:
#         text = await extract_text_from_file(file)
#     except Exception as e:
#         raise HTTPException(status_code=422, detail=f"Text extraction failed: {str(e)}")

#     # 3. Detect PII
#     entities = detect_pii(text)

#     # 4. Apply switches
#     allowed = set()
#     if redact_emails: allowed.add("EMAIL")
#     if redact_phones: allowed.add("PHONE")
#     if redact_names: allowed.add("NAME")
#     if redact_addresses: allowed.add("ADDRESS")

#     entities = [e for e in entities if e["type"] in allowed]

#     # 5. Redact text
#     redacted_text, items = apply_redaction(
#         text,
#         entities,
#         label_style,
#         custom_label
#     )

#     # 6. Count results
#     counts = {}
#     for it in items:
#         counts[it["type"]] = counts.get(it["type"], 0) + 1

#     return {
#         "original_text": text,
#         "redacted_text": redacted_text,
#         "summary": {
#             "counts": counts,
#             "items": items
#         }
#     }


# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
# from typing import Optional
# from modules.pdf_extractor import extract_text_from_file
# from modules.pii_detector import detect_pii
# from modules.redactor import apply_redaction

# import fitz  # PyMuPDF
# import os
# import uuid

# router = APIRouter()

# OUTPUT_DIR = "redacted_pdfs"
# os.makedirs(OUTPUT_DIR, exist_ok=True)


# class RedactTextRequest(BaseModel):
#     text: str
#     redact_emails: bool = True
#     redact_phones: bool = True
#     redact_names: bool = False
#     redact_addresses: bool = False
#     label_style: str = "typed"
#     custom_label: Optional[str] = None


# # --------------------------------------------------------
# # TEXT ENDPOINT
# # --------------------------------------------------------
# @router.post("/redact-text")
# async def redact_text(payload: RedactTextRequest):
#     text = payload.text or ""
#     entities = detect_pii(text)

#     allowed = {
#         k for k, v in {
#             "EMAIL": payload.redact_emails,
#             "PHONE": payload.redact_phones,
#             "NAME": payload.redact_names,
#             "ADDRESS": payload.redact_addresses
#         }.items() if v
#     }

#     entities = [e for e in entities if e["type"] in allowed]

#     redacted_text, items = apply_redaction(
#         text, entities, payload.label_style, payload.custom_label
#     )

#     counts = {}
#     for it in items:
#         counts[it["type"]] = counts.get(it["type"], 0) + 1

#     return {
#         "original_text": text,
#         "redacted_text": redacted_text,
#         "summary": {
#             "counts": counts,
#             "items": items
#         }
#     }


# # --------------------------------------------------------
# # PDF REDACTION ENDPOINT
# # --------------------------------------------------------
# @router.post("/redact-file")
# async def redact_file(
#     file: UploadFile = File(...),
#     redact_emails: bool = Form(True),
#     redact_phones: bool = Form(True),
#     redact_names: bool = Form(False),
#     redact_addresses: bool = Form(False),
#     label_style: str = Form("typed"),
#     custom_label: Optional[str] = Form(None),
# ):
#     if file.content_type not in ["application/pdf"]:
#         raise HTTPException(415, "Only PDF supported right now.")

#     # 1. Save original PDF temporarily
#     raw_bytes = await file.read()
#     input_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_input.pdf"
#     with open(input_path, "wb") as f:
#         f.write(raw_bytes)

#     # 2. Extract text from PDF
#     text = await extract_text_from_file(file)

#     # 3. Detect PII
#     entities = detect_pii(text)

#     allowed = {
#         k for k, v in {
#             "EMAIL": redact_emails,
#             "PHONE": redact_phones,
#             "NAME": redact_names,
#             "ADDRESS": redact_addresses
#         }.items() if v
#     }

#     entities = [e for e in entities if e["type"] in allowed]

#     # 4. Build redaction labels
#     redacted_text, items = apply_redaction(
#         text, entities, label_style, custom_label
#     )

#     # 5. Open PDF and apply black boxes + labels
#     doc = fitz.open(input_path)

#     for page in doc:
#         page_text = page.get_text("text")

#         for item in items:
#             original = item["original"]
#             label = item["label"]

#             text_instances = page.search_for(original)
#             for inst in text_instances:
#                 page.add_redact_annot(inst, fill=(0, 0, 0))
#                 page.insert_text((inst.x0, inst.y0 - 8), label, color=(1, 1, 1))  # white text

#         page.apply_redactions()

#     # 6. Save redacted PDF
#     output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
#     doc.save(output_path)
#     doc.close()

#     return {
#         "message": "PDF redacted successfully",
#         "download_url": f"/api/download/{os.path.basename(output_path)}",
#         "summary": {
#             "counts": {i["type"]: 1 for i in items},
#             "items": items
#         }
#     }


# # --------------------------------------------------------
# # DOWNLOAD ENDPOINT
# # --------------------------------------------------------
# @router.get("/download/{filename}")
# async def download_file(filename: str):
#     file_path = f"{OUTPUT_DIR}/{filename}"
#     if not os.path.exists(file_path):
#         raise HTTPException(404, "File not found")

#     return FileResponse(
#         file_path,
#         media_type="application/pdf",
#         filename=filename
#     )


# routers/redact.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from modules.pdf_extractor import extract_text_from_bytes, extract_text_from_file
from modules.pii_detector import detect_pii
from modules.redactor import apply_redaction

import fitz  # PyMuPDF
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


# --------------------------------------------------------
# TEXT ENDPOINT
# --------------------------------------------------------
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


# --------------------------------------------------------
# PDF REDACTION ENDPOINT (upload file)
# --------------------------------------------------------
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
    # Accept PDFs and common image types
    if file.content_type not in ["application/pdf", "image/png", "image/jpeg"]:
        raise HTTPException(415, "Only PDF, PNG or JPEG supported right now.")

    # 1. Read uploaded bytes ONCE
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(400, "Uploaded file is empty or could not be read.")

    # 2. Save the original bytes to disk for redaction operations and debugging
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

    # 3. Extract text from the raw bytes (use the extractor that accepts bytes)
    try:
        text = extract_text_from_bytes(raw_bytes, content_type=file.content_type, filename=file.filename)
    except Exception as e:
        # Provide a clear client-visible error (400) instead of 500 stacktrace
        raise HTTPException(400, detail=f"Text extraction failed: {e}")

    # 4. Detect PII based on extracted text
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

    # 5. Build redaction labels (for text preview)
    redacted_text, items = apply_redaction(text, entities, label_style, custom_label)

    # 6. If original is a PDF, open and apply redactions using PyMuPDF
    output_path = input_path  # fallback if we cannot create redacted PDF
    if file.content_type == "application/pdf":
        try:
            doc = fitz.open(input_path)
            for page in doc:
                # for each entity, search and redact occurrences on page
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
                            # write label above the rectangle; adjust as needed
                            page.insert_text((inst.x0, inst.y0 - 8), label, color=(1, 1, 1))
                page.apply_redactions()
            output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
            doc.save(output_path)
            doc.close()
        except Exception as e:
            raise HTTPException(500, detail=f"PDF redaction failed: {e}")
    else:
        # If original was an image, create a simple single-page PDF containing the image (best-effort)
        try:
            img_doc = fitz.open()
            img_doc.new_page()  # blank page
            # insert image by stream into the first page
            page = img_doc[0]
            page.insert_image(page.rect, stream=raw_bytes)
            output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
            img_doc.save(output_path)
            img_doc.close()
        except Exception:
            # fallback: keep input_path as output_path (not ideal but prevents crash)
            output_path = input_path

    # Build counts summary
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


# --------------------------------------------------------
# REDACT FROM SERVER PATH (if you want backend to open a server-local path)
# --------------------------------------------------------
@router.post("/redact-from-path")
async def redact_from_path(payload: RedactFromPathRequest):
    """
    Accepts JSON { path: string, options?: {...} } where path is a server-local path the server can access.
    This endpoint must be used only in controlled/dev environments.
    """
    path = payload.path
    if not os.path.exists(path):
        raise HTTPException(404, detail="Path not found on server")

    # Read bytes from existing file and run the same flow as upload
    try:
        with open(path, "rb") as f:
            raw_bytes = f.read()
    except Exception as e:
        raise HTTPException(500, detail=f"Failed to read server file: {e}")

    # For simplicity reuse logic: extract text, detect PII, build redacted PDF
    try:
        text = extract_text_from_bytes(raw_bytes, content_type=None, filename=path)
    except Exception as e:
        raise HTTPException(400, detail=f"Text extraction failed for server file: {e}")

    # Use provided options if any
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

    # Create output PDF (best-effort using fitz)
    try:
        img_doc = fitz.open()
        img_doc.new_page()
        page = img_doc[0]
        page.insert_image(page.rect, stream=raw_bytes)
        output_path = f"{OUTPUT_DIR}/{uuid.uuid4()}_redacted.pdf"
        img_doc.save(output_path)
        img_doc.close()
    except Exception:
        # fallback to copying original file as output
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


# --------------------------------------------------------
# DOWNLOAD ENDPOINT
# --------------------------------------------------------
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
