from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers.redact import router as redact_router

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

import logging
from collections import defaultdict, deque
from time import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("pii_redaction")

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Very simple in-memory rate limiter: max_requests per window_seconds per client IP.

    NOTE:
      - Good enough for dev / small deployments.
      - For real production with multiple instances, use Redis-based rate limiting.
    """

    def __init__(self, app, max_requests: int = 60, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests = defaultdict(deque)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time()
        q = self._requests[client_ip]

        while q and q[0] <= now - self.window_seconds:
            q.popleft()

        if len(q) >= self.max_requests:
            logger.warning("Rate limit exceeded for IP %s", client_ip)
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests, please try again later."},
            )

        q.append(now)
        response = await call_next(request)
        return response


app = FastAPI(title="PII Redaction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=60, window_seconds=60)

app.include_router(redact_router, prefix="/api")


@app.get("/")
async def root():
    logger.info("Root endpoint hit")
    return {"message": "PII Redaction API running"}

