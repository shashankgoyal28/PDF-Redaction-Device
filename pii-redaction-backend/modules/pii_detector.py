import re
from typing import List, Dict

EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE
)

PHONE_RE = re.compile(
    r"""
    (\+?\d{1,3}[\s-]*)?
    (\(?\d{3}\)?[\s-]*)
    (\d{3}[\s-]*)
    (\d{4})
    """,
    re.VERBOSE
)

NAME_RE = re.compile(
    r"""
    (?<!\S)
    (?:Dr\.|Mr\.|Mrs\.|Ms\.)?
    \s*
    [A-Z][a-z]{2,20}
    (?:\s[A-Z][a-z]{2,20}){1,2}
    (?!\S)
    """,
    re.VERBOSE
)

BAD_NAME_WORDS = {
    "library", "card", "title", "publisher", "author",
    "return", "date", "notes"
}


ADDRESS_RE = re.compile(
    r"""
    \b
    \d+\s+[A-Za-z0-9\s]+
    (Street|St|Road|Rd|Lane|Ln|Avenue|Ave|
     Boulevard|Blvd|Drive|Dr|Court|Ct|
     Circle|Cir|Place|Pl|Way)
    \b
    """,
    re.IGNORECASE | re.VERBOSE
)

def detect_pii(text: str) -> List[Dict]:
    entities = []
    if not text:
        return entities

    for m in EMAIL_RE.finditer(text):
        entities.append({
            "type": "EMAIL",
            "start": m.start(),
            "end": m.end(),
            "text": m.group(),
            "reason": "email"
        })

    for m in PHONE_RE.finditer(text):
        phone = m.group().strip()
        if len(re.sub(r"\D", "", phone)) >= 7:
            entities.append({
                "type": "PHONE",
                "start": m.start(),
                "end": m.end(),
                "text": phone,
                "reason": "phone"
            })

    offset = 0
    for line in text.split("\n"):
        for m in NAME_RE.finditer(line):
            name = m.group().strip()

            lower_tokens = name.lower().split()
            if any(w in BAD_NAME_WORDS for w in lower_tokens):
                continue

            entities.append({
                "type": "NAME",
                "start": offset + m.start(),
                "end": offset + m.end(),
                "text": name,
                "reason": "name"
            })
        offset += len(line) + 1

    for m in ADDRESS_RE.finditer(text):
        entities.append({
            "type": "ADDRESS",
            "start": m.start(),
            "end": m.end(),
            "text": m.group(),
            "reason": "address"
        })

    entities.sort(key=lambda e: e["start"])
    return entities





