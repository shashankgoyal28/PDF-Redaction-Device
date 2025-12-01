# Purpose of this module
# This module is responsible for extracting text from:
# PDF files (using pdfplumber)
# Image files (using OCR with PIL + pytesseract, if available)
# It takes raw bytes or an UploadFile from FastAPI and 
# returns plain text that will later be scanned for PII.

import io
import pdfplumber

try:
    from PIL import Image
    import pytesseract
    _OCR_AVAILABLE = True
except Exception:
    _OCR_AVAILABLE = False


async def extract_text_from_file(file):
    """
    Backwards-compatible wrapper: reads UploadFile once and delegates to extract_text_from_bytes.
    This consumes the UploadFile stream.
    """
    contents = await file.read()
    return extract_text_from_bytes(contents, content_type=getattr(file, "content_type", None), filename=getattr(file, "filename", None))


def extract_text_from_bytes(contents: bytes, content_type: str | None = None, filename: str | None = None) -> str:
    """
    Extract text from raw bytes. Handles PDF first (pdfplumber) then falls back to OCR for images (PIL/pytesseract).
    Raises RuntimeError with a clear message on failure.
    """
    if not contents:
        return ""

    is_pdf = (content_type == "application/pdf") or (filename and filename.lower().endswith(".pdf"))

    if is_pdf:
        try:
            text_pages = []
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text() or ""
                    text_pages.append(page_text)
            return "\n".join(text_pages)
        except Exception as e:
            pdf_err = e
            if not _OCR_AVAILABLE:
                raise RuntimeError(f"PDF extraction failed and OCR not available: {pdf_err}")

    if not _OCR_AVAILABLE:
        raise RuntimeError(
            "File is not a valid PDF or PDF extraction failed, and OCR (PIL/pytesseract) is not installed."
        )

    try:
        img = Image.open(io.BytesIO(contents))
        return pytesseract.image_to_string(img)
    except Exception as ex:
        raise RuntimeError(f"PDF extraction failed and OCR fallback failed: {ex}")
