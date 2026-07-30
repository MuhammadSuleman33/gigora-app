import logging
import os
from logging.handlers import RotatingFileHandler

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from auth import router as auth_router
from rate_limiter import limiter
from routes import payment
from routes.history import router as history_router
from routes.profile import router as profile_router
from routes.proposal import router as proposal_router
from routes.seo import router as seo_router
from routes.usage import router as usage_router
from routes.user import router as user_router


# -------------------------------------------------
# Environment configuration
# -------------------------------------------------

environment = os.getenv(
    "ENVIRONMENT",
    "development",
).strip().lower()

frontend_url = os.getenv(
    "FRONTEND_URL",
    "",
).strip().rstrip("/")


# -------------------------------------------------
# Application constants
# -------------------------------------------------

MAX_REQUEST_SIZE = 1_000_000  # 1 MB


# -------------------------------------------------
# Error logging
# -------------------------------------------------

logger = logging.getLogger("gigora")
logger.setLevel(logging.ERROR)

if not logger.handlers:
    error_file_handler = RotatingFileHandler(
        "errors.log",
        maxBytes=1_000_000,
        backupCount=3,
        encoding="utf-8",
    )

    error_formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    error_file_handler.setFormatter(error_formatter)
    logger.addHandler(error_file_handler)


# -------------------------------------------------
# FastAPI application
# -------------------------------------------------

app = FastAPI(
    title="Gigora API",
    version="1.0.0",
)


# -------------------------------------------------
# Request body size protection
# -------------------------------------------------

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        content_length = request.headers.get("content-length")

        if content_length:
            try:
                request_size = int(content_length)
            except (TypeError, ValueError):
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": "Invalid Content-Length header.",
                    },
                )

            if request_size < 0:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": "Invalid Content-Length header.",
                    },
                )

            if request_size > MAX_REQUEST_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={
                        "detail": (
                            "Request body is too large. "
                            "Maximum allowed size is 1 MB."
                        ),
                    },
                )

        return await call_next(request)


app.add_middleware(RequestSizeLimitMiddleware)


# -------------------------------------------------
# Security headers
# -------------------------------------------------

@app.middleware("http")
async def add_security_headers(
    request: Request,
    call_next,
):
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    response.headers["Referrer-Policy"] = (
        "strict-origin-when-cross-origin"
    )

    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    response.headers["Cross-Origin-Opener-Policy"] = (
        "same-origin"
    )

    response.headers["Cross-Origin-Resource-Policy"] = (
        "same-origin"
    )

    # Railway and Vercel already provide HTTPS.
    # HSTS is enabled only in production.
    if environment == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )

    # A strict Content Security Policy is safe for API responses.
    # Swagger and ReDoc are excluded because they load scripts
    # and styles needed for their interfaces.
    if request.url.path not in {
        "/docs",
        "/redoc",
        "/openapi.json",
    }:
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; "
            "frame-ancestors 'none'; "
            "base-uri 'none'; "
            "form-action 'none'"
        )

    return response


# -------------------------------------------------
# SlowAPI configuration
# -------------------------------------------------

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded,
):
    return JSONResponse(
        status_code=429,
        content={
            "detail": (
                "Too many requests. "
                "Please wait a minute and try again."
            ),
        },
    )


# -------------------------------------------------
# Error handlers
# -------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled exception | method=%s | path=%s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error.",
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    errors = []

    for error in exc.errors():
        field = ".".join(
            str(item)
            for item in error.get("loc", [])
            if item != "body"
        )

        errors.append(
            {
                "field": field or "request",
                "message": error.get(
                    "msg",
                    "Invalid value.",
                ),
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Request validation failed.",
            "errors": errors,
        },
    )


# -------------------------------------------------
# CORS configuration
# -------------------------------------------------

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if frontend_url:
    allowed_origins.append(frontend_url)

allowed_origins = list(dict.fromkeys(allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,

    # Supports Vercel preview deployments.
    # Example:
    # https://gigora-xxxxx.vercel.app
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],

    allow_headers=[
        "Authorization",
        "Content-Type",
    ],
)


# -------------------------------------------------
# Routers
# -------------------------------------------------

app.include_router(payment.router)
app.include_router(auth_router)

app.include_router(
    proposal_router,
    prefix="/api/proposal",
    tags=["Proposal"],
)

app.include_router(
    seo_router,
    prefix="/api/seo",
    tags=["SEO"],
)

app.include_router(
    profile_router,
    prefix="/api/profile",
    tags=["Profile"],
)

app.include_router(
    history_router,
    prefix="/api/history",
    tags=["History"],
)

app.include_router(
    user_router,
    prefix="/api",
)

app.include_router(
    usage_router,
    prefix="/api/usage",
    tags=["Usage"],
)


# -------------------------------------------------
# Health check
# -------------------------------------------------

@app.get(
    "/health",
    tags=["Health"],
)
async def health_check():
    return {
        "status": "healthy",
        "environment": environment,
    }