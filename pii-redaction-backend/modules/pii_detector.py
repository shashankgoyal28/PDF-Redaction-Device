# # paste the full pii_detector.py implementation here (see earlier chat)
# import re
# from typing import List, Dict

# # Email pattern
# EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", re.IGNORECASE)

# # Phone pattern (relaxed)
# PHONE_RE = re.compile(
#     r"""(?x)
#     (?:\+?\d{1,3}[\s-]?)?           # optional country code
#     (?:\(\d{2,4}\)[\s-]?|\d{2,4}[\s-]?)?  # optional area code
#     (?:\d{3,4}[\s-]?\d{3,4})        # main number groups
#     """
# )

# # Simple name heuristic: two capitalized words (First Last)
# NAME_RE = re.compile(r"\b([A-Z][a-z]{1,20}\s[A-Z][a-z]{1,20})\b")

# # Address heuristic: presence of common keywords
# ADDRESS_KEYWORDS = r"(street|st|road|rd|lane|ln|avenue|ave|apartment|apt|suite|sector|block|boulevard|blvd)"
# ADDRESS_RE = re.compile(rf".{{0,80}}({ADDRESS_KEYWORDS}).{{0,80}}", re.IGNORECASE)

# def detect_pii(text: str) -> List[Dict]:
#     entities = []
#     if not text:
#         return entities

#     # Emails
#     for m in EMAIL_RE.finditer(text):
#         entities.append({"type": "EMAIL", "start": m.start(), "end": m.end(), "text": m.group(), "reason": "email_regex"})

#     # Phones
#     for m in PHONE_RE.finditer(text):
#         entities.append({"type": "PHONE", "start": m.start(), "end": m.end(), "text": m.group().strip(), "reason": "phone_regex"})

#     # Names (naive)
#     for m in NAME_RE.finditer(text):
#         if "@" not in m.group():  # avoid capturing parts of emails
#             entities.append({"type": "NAME", "start": m.start(), "end": m.end(), "text": m.group(), "reason": "name_heuristic"})

#     # Addresses
#     for m in ADDRESS_RE.finditer(text):
#         entities.append({"type": "ADDRESS", "start": m.start(), "end": m.end(), "text": m.group(), "reason": "address_keyword"})

#     # sort by start index
#     entities.sort(key=lambda e: e["start"])
#     return entities



import re
from typing import List, Dict

# EMAIL
EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
    re.IGNORECASE
)

# PHONE
PHONE_RE = re.compile(
    r"""
    (\+?\d{1,3}[\s-]*)?
    (\(?\d{3}\)?[\s-]*)
    (\d{3}[\s-]*)
    (\d{4})
    """,
    re.VERBOSE
)

# NAME (good)
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

# BAD name words (REMOVE false positives)
BAD_NAME_WORDS = {
    "library", "card", "title", "publisher", "author",
    "return", "date", "notes"
}

# ADDRESS
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

    # EMAIL
    for m in EMAIL_RE.finditer(text):
        entities.append({
            "type": "EMAIL",
            "start": m.start(),
            "end": m.end(),
            "text": m.group(),
            "reason": "email"
        })

    # PHONE
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

    # NAME (line-by-line)
    offset = 0
    for line in text.split("\n"):
        for m in NAME_RE.finditer(line):
            name = m.group().strip()

            # Skip bad name words
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

    # ADDRESS
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





