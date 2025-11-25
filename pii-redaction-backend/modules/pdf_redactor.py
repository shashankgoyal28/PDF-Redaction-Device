# modules/pdf_redactor.py
import io
import fitz  # PyMuPDF
from typing import List, Dict, Optional

def _make_label_text(type_name: str, idx: int, style: str, custom_label: Optional[str]):
    if style == "typed":
        return f"[{type_name}_{idx}]"
    elif style == "blackbox":
        return None  # None means draw filled rect only
    elif style == "custom" and custom_label:
        return custom_label
    else:
        return "[REDACTED]"

def create_redacted_pdf_bytes(
    input_pdf_bytes: bytes,
    entities: List[Dict],
    label_style: str = "typed",
    custom_label: Optional[str] = None,
):
    """
    input_pdf_bytes: bytes of uploaded PDF
    entities: list of { type, start, end, text, (optional) page, (optional) bbox }
      Ideally entities are the plain-text entity dicts. We'll search entity['text'] on each page.
    Returns: bytes of new redacted PDF
    """
    doc = fitz.open(stream=input_pdf_bytes, filetype="pdf")

    # counters for typed labels
    counters = {}

    # Normalize entity texts for search; we will attempt exact search per entity text
    for ent in entities:
        t = ent["type"]
        counters[t] = counters.get(t, 0) + 1
        ent["_label_text"] = _make_label_text(t, counters[t], label_style, custom_label)

    # For each page, search and redact
    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text()  # fallback check

        # For each entity, search on page
        for ent in entities:
            search_text = ent["text"]
            if not search_text or len(search_text.strip()) == 0:
                continue

            # page.search_for returns list of rects where the text was found
            try:
                rects = page.search_for(search_text, hit_max=64)  # limit to avoid runaway
            except Exception:
                rects = []

            # If search didn't find anything, try case-insensitive fallback
            if not rects:
                try:
                    rects = page.search_for(search_text.lower(), hit_max=64)
                except Exception:
                    rects = []

            for r in rects:
                # Draw redaction: either black rectangle or rectangle + typed label
                if label_style == "blackbox":
                    # draw solid black rect covering the text
                    page.draw_rect(r, color=(0, 0, 0), fill=(0, 0, 0))
                else:
                    # Draw filled rectangle (black) and optionally write label on top (white)
                    page.draw_rect(r, color=(0, 0, 0), fill=(0, 0, 0))
                    label = ent.get("_label_text")
                    if label:
                        # compute a font size appropriate to rect height
                        height = r.height
                        font_size = max(6, int(height * 0.7))
                        # write label inside rect (white text)
                        text_pos = fitz.Point(r.x0 + 1, r.y0 + font_size)  # a little inset
                        page.insert_text(text_pos, label, fontsize=font_size, color=(1, 1, 1))

    # Save to bytes
    out = io.BytesIO()
    doc.save(out)
    doc.close()
    out.seek(0)
    return out.read()
