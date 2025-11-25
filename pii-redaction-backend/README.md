PII Redaction Backend (FastAPI)
-------------------------------

1. Create a virtual environment and install deps:
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

2. Start the server (development):
   uvicorn main:app --reload --port 8000

3. API endpoints:
   POST /api/redact-text  (JSON)
   POST /api/redact-file  (multipart/form-data)

4. Example curl (text):
   curl -X POST "http://127.0.0.1:8000/api/redact-text" \\
     -H "Content-Type: application/json" \\
     -d '{"text":"Contact John Doe at john.doe@example.com or +1 555-123-4567. Lives on 221B Baker Street.","redact_emails":true,"redact_phones":true,"redact_names":true,"redact_addresses":true,"label_style":"typed"}'

5. Example curl (file) - using the local test file available in this environment:
   curl -X POST "http://127.0.0.1:8000/api/redact-file" \\
     -F "file=@/mnt/data/Screenshot 2025-11-20 at 9.00.47 PM.png" \\
     -F "redact_emails=true" \\
     -F "redact_phones=true" \\
     -F "redact_names=false" \\
     -F "redact_addresses=false" \\
     -F "label_style=typed"

Notes:
- For PDFs, pdfplumber extracts text from digital PDFs.
- For images, install pytesseract and the system tesseract executable to enable OCR.
