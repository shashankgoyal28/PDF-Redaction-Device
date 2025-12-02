📄 PII Redaction Tool

A full-stack application for detecting and redacting Personally Identifiable Information (PII) from text, PDF, and images.
Built with React + TypeScript, FastAPI, and Python text/PDF processing tools.

🚀 Features
🔍 PII Detection

Detects the following using regex-based rules:

📧 Emails
📱 Phone Numbers
🧑 Names
🏠 Addresses

🖥️ Two Operating Modes
1. Text Mode
Paste any text directly.
Choose redaction style:
Typed labels → [EMAIL_1]
Black boxes → ██████
Custom labels → [REDACTED]
Output includes:
Original text
Redacted text
Redaction Summary

2. PDF Mode
Upload PDFs, JPEGs, PNGs.
Backend extracts text, detects PII, and redacts the PDF using PyMuPDF.
PDFs always use solid black-box redaction (industry standard & legally safe).
Produces a downloadable redacted PDF.
🧠 How It Works (Architecture Overview)

Frontend (React + TypeScript)

Handles:
User interaction
File upload
Text mode input
Redaction options
Preview & results UI
Downloading the final PDF
Key components:
InputPage.tsx
ResultsPage.tsx
FileUploader.tsx
api/redact.ts

Backend (FastAPI)

API routes:
Endpoint	Description
POST /api/redact-text	Redacts raw text input
POST /api/redact-file	Redacts uploaded PDF/image
GET /api/download/{filename}	Downloads redacted PDF

Responsibilities:
Text extraction (PDF/Image)
PII detection
Text redaction (labels)
PDF redaction (black boxes)

File storage & cleanup

Core Python Modules
Module	Purpose
pdf_extractor.py	Extract text from PDFs or images (OCR fallback)
pii_detector.py	Regex-based detection of EMAIL, PHONE, NAME, ADDRESS
redactor.py	Generates redacted text + label mapping
PyMuPDF (fitz)	Draws black boxes over sensitive content in the PDF

🔁 End-to-End Workflow
Text Mode
User enters text → chooses PII/label options.
Frontend sends JSON to /api/redact-text.

Backend:
Detects PII
Applies redaction based on label style
Response returned:
original_text
redacted_text
summary
UI displays results.

PDF Mode
User uploads PDF/image.
Frontend sends file via FormData → /api/redact-file.

Backend:
Saves file
Extracts text
Detects PII
Applies text redaction (for display)
Uses PyMuPDF to draw solid black boxes over sensitive regions
Saves final PDF

Frontend retrieves:
summary
preview
download_url

User downloads redacted PDF.

🛠️ Tech Stack
Frontend
React (Vite)
TypeScript
React Router
HTML/CSS (custom UI styling)

Backend
FastAPI
Python 3.10+
PyMuPDF (PDF redaction)
pdfplumber (PDF text extraction)
Pillow + pytesseract (OCR fallback)
Uvicorn (ASGI server)

📂 Project Structure
PII_Project/
│
├── pii-redaction-backend/
│   ├── main.py                  # FastAPI entrypoint
│   ├── routers/redact.py        # API endpoints
│   ├── modules/
│   │   ├── pdf_extractor.py     # Extract PDF/image text
│   │   ├── pii_detector.py      # Detect PII
│   │   ├── redactor.py          # Create redacted text
│   ├── redacted_pdfs/           # Outputs
│   ├── requirements.txt
│   └── venv/
│
└── pii-redaction-ui/
    ├── src/pages/InputPage.tsx
    ├── src/pages/ResultsPage.tsx
    ├── src/components/FileUploader.tsx
    ├── src/api/redact.ts
    ├── public/
    └── package.json

▶️ Running the Project
Backend
cd pii-redaction-backend
source venv/bin/activate  # or activate.bat on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Frontend
cd pii-redaction-ui
npm install
npm run dev

Frontend runs at: http://localhost:5173
Backend runs at: http://localhost:8000
Currently working on the Local Environment working onto to host on Production Environment.

🧪 Example Outputs
Text Before:
Contact John Doe at john@example.com or 9876543210.

Redacted (Typed):
Contact [NAME_1] at [EMAIL_1] or [PHONE_1].

Redacted (Blackbox):
Contact ██████ at ██████ or ███████.

PDF Output:

Sensitive regions are fully black boxed

Downloadable from /api/download/<filename>.pdf

🔒 Security Notes

PDF redaction uses annotation + burn-in, ensuring data is unrecoverable.
Custom labels are never written into PDFs (only solid black boxes).
File access outside upload directory is blocked.

📝 Future Improvements

Machine Learning–based PII detection
Better OCR alignment for scanned PDFs
Highlight mode (instead of black boxes)
Multi-language PII patterns
Fine-grained redaction preview before applying

🧑‍💻 Author

Shashank Goyal +91 8107787245
Full-stack developer | Python & React | Embedded & Systems Engineering
