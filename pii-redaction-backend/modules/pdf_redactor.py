import io
import fitz  
from typing import List, Dict, Optional

def _make_label_text(type_name: str, idx: int, style: str, custom_label: Optional[str]):
    if style == "typed":
        return f"[{type_name}_{idx}]"
    elif style == "blackbox":
        return None  
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

    counters = {}

    for ent in entities:
        t = ent["type"]
        counters[t] = counters.get(t, 0) + 1
        ent["_label_text"] = _make_label_text(t, counters[t], label_style, custom_label)

    for page_num in range(len(doc)):
        page = doc[page_num]
        page_text = page.get_text()  

        for ent in entities:
            search_text = ent["text"]
            if not search_text or len(search_text.strip()) == 0:
                continue

            try:
                rects = page.search_for(search_text, hit_max=64)  
            except Exception:
                rects = []

            if not rects:
                try:
                    rects = page.search_for(search_text.lower(), hit_max=64)
                except Exception:
                    rects = []

            for r in rects:
                if label_style == "blackbox":
                    page.draw_rect(r, color=(0, 0, 0), fill=(0, 0, 0))
                else:
                    page.draw_rect(r, color=(0, 0, 0), fill=(0, 0, 0))
                    label = ent.get("_label_text")
                    if label:
                        height = r.height
                        font_size = max(6, int(height * 0.7))
                        text_pos = fitz.Point(r.x0 + 1, r.y0 + font_size) 
                        page.insert_text(text_pos, label, fontsize=font_size, color=(1, 1, 1))

    out = io.BytesIO()
    doc.save(out)
    doc.close()
    out.seek(0)
    return out.read()
