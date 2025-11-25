from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.redact import router as redact_router

app = FastAPI(title="PII Redaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          
    allow_credentials=True,
    allow_methods=["*"],          
    allow_headers=["*"],          
)

app.include_router(redact_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "PII Redaction API running"}
