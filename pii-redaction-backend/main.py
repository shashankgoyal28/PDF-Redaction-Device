# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from routers.redact import router as redact_router

# app = FastAPI(title="PII Redaction API")

# # adjust origins if your frontend serves from different host/port
# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173"
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(redact_router, prefix="/api")


# @app.get("/")
# async def root():
#     return {"message": "PII Redaction API running"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.redact import router as redact_router

app = FastAPI(title="PII Redaction API")

# DEV: allow everything so browser preflight won't be blocked.
# Change to specific origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins during local dev
    allow_credentials=True,
    allow_methods=["*"],          # allow all HTTP methods
    allow_headers=["*"],          # allow all headers
)

app.include_router(redact_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "PII Redaction API running"}
