from typing import List, Dict, Optional

def apply_redaction(text: str, entities: List[Dict], label_style: str = "typed", custom_label: Optional[str] = None):
    """
    Replace spans in text with labels.

    entities: list of {type, start, end, text}
    label_style: "typed" | "blackbox" | "custom"
    Returns (redacted_text, items)
    """
    if not entities:
        return text, []
    counters = {}
    items = []

    for e in entities:
        t = e["type"]
        counters[t] = counters.get(t, 0) + 1

        if label_style == "typed":
            label = f"[{t}_{counters[t]}]"
        elif label_style == "blackbox":
            label = "█" * max(6, len(e["text"]) // 2)
        elif label_style == "custom" and custom_label:
            label = custom_label
        else:
            label = "[REDACTED]"

        items.append({
            "type": t,
            "original": e["text"],
            "label": label,
            "start": e["start"],
            "end": e["end"]
        })

    redacted = text
    for it in sorted(items, key=lambda x: x["start"], reverse=True):
        s, en = it["start"], it["end"]
        redacted = redacted[:s] + it["label"] + redacted[en:]

    return redacted, items