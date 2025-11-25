# # paste the full pdf_extractor.py implementation here (see earlier chat)
# import io
# from fastapi import UploadFile

# # pdf extraction
# import pdfplumber

# # optional OCR fallback
# try:
#     from PIL import Image
#     import pytesseract
#     _OCR_AVAILABLE = True
# except Exception:
#     _OCR_AVAILABLE = False

# async def extract_text_from_file(file: UploadFile) -> str:
#     """
#     Accepts UploadFile (PDF or image). Returns extracted text.
#     For PDFs uses pdfplumber. For images uses pytesseract (if installed).
#     """
#     contents = await file.read()

#     # If it's a PDF (content type or filename)
#     is_pdf = (file.content_type == "application/pdf") or (file.filename and file.filename.lower().endswith(".pdf"))

#     if is_pdf:
#         try:
#             text_pages = []
#             with pdfplumber.open(io.BytesIO(contents)) as pdf:
#                 for page in pdf.pages:
#                     page_text = page.extract_text() or ""
#                     text_pages.append(page_text)
#             return "\n".join(text_pages)
#         except Exception as e:
#             # fallback to OCR if available
#             if _OCR_AVAILABLE:
#                 try:
#                     img = Image.open(io.BytesIO(contents))
#                     return pytesseract.image_to_string(img)
#                 except Exception as ex:
#                     raise RuntimeError(f"PDF extraction failed and OCR fallback failed: {ex}")
#             raise RuntimeError(f"PDF extraction failed: {e}")
#     else:
#         # treat as image
#         if not _OCR_AVAILABLE:
#             raise RuntimeError("OCR not available. Install pillow and pytesseract to enable image OCR.")
#         image = Image.open(io.BytesIO(contents))
#         return pytesseract.image_to_string(image)


# # modules/pdf_extractor.py
# import io
# from fastapi import UploadFile
# import pdfplumber

# # optional OCR fallback
# try:
#     from PIL import Image
#     import pytesseract
#     _OCR_AVAILABLE = True
# except Exception:
#     _OCR_AVAILABLE = False

# async def extract_text_from_file(file: UploadFile) -> str:
#     """
#     Backwards-compatible wrapper: reads UploadFile once and delegates to extract_text_from_bytes.
#     Note: this WILL consume the UploadFile stream.
#     """
#     contents = await file.read()
#     return extract_text_from_bytes(contents, content_type=file.content_type, filename=file.filename)

# def extract_text_from_bytes(contents: bytes, content_type: str | None = None, filename: str | None = None) -> str:
#     """
#     Extract text from raw bytes. Handles PDF first (pdfplumber) then falls back to OCR for images (PIL/pytesseract).
#     Raises RuntimeError with a clear message on failure.
#     """
#     if not contents:
#         return ""

#     # Determine if it's a PDF by content-type or filename heuristics
#     is_pdf = (content_type == "application/pdf") or (filename and filename.lower().endswith(".pdf"))

#     if is_pdf:
#         try:
#             text_pages = []
#             with pdfplumber.open(io.BytesIO(contents)) as pdf:
#                 for page in pdf.pages:
#                     page_text = page.extract_text() or ""
#                     text_pages.append(page_text)
#             return "\n".join(text_pages)
#         except Exception as e:
#             # pdfplumber failed; we'll try OCR below (if available), but include original exception in message
#             pdf_err = e
#             # fallthrough to image/OCR attempt (if available)
#             if not _OCR_AVAILABLE:
#                 raise RuntimeError(f"PDF extraction failed and OCR not available: {pdf_err}")
#             # else continue to OCR attempt below

#     # Not a PDF or pdfplumber failed -> try image OCR if available
#     if not _OCR_AVAILABLE:
#         # If we got here and OCR isn't available, show helpful message
#         raise RuntimeError(
#             "File is not a valid PDF or PDF extraction failed, and OCR (PIL/pytesseract) is not installed."
#         )

#     try:
#         img = Image.open(io.BytesIO(contents))
#         return pytesseract.image_to_string(img)
#     except Exception as ex:
#         raise RuntimeError(f"PDF extraction failed and OCR fallback failed: {ex}")
# modules/pdf_extractor.py
import io
import pdfplumber

# optional OCR fallback
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

    # Determine if it's likely a PDF by content-type or filename heuristics
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
            # record pdf error then attempt OCR fallback if available
            pdf_err = e
            if not _OCR_AVAILABLE:
                raise RuntimeError(f"PDF extraction failed and OCR not available: {pdf_err}")
            # otherwise fall through to OCR attempt below

    # Not a PDF or pdfplumber failed -> try image OCR if available
    if not _OCR_AVAILABLE:
        raise RuntimeError(
            "File is not a valid PDF or PDF extraction failed, and OCR (PIL/pytesseract) is not installed."
        )

    try:
        img = Image.open(io.BytesIO(contents))
        return pytesseract.image_to_string(img)
    except Exception as ex:
        raise RuntimeError(f"PDF extraction failed and OCR fallback failed: {ex}")
