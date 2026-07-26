import logging
from logging.handlers import RotatingFileHandler

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from auth import router as auth_router
from rate_limiter import limiter
from routes import payment
from routes.history import router as history_router
from routes.profile import router as profile_router
from routes.proposal import router as proposal_router
from routes.seo import router as seo_router
from routes.usage import router as usage_router
from routes.user import router as user_router
from logger_config import logger

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
        encoding="utf-8"
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
    version="1.0.0"
)


# -------------------------------------------------
# SlowAPI configuration
# -------------------------------------------------

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded
):
    return JSONResponse(
        status_code=429,
        content={
            "detail": (
                "Too many requests. "
                "Please wait a minute and try again."
            )
        }
    )


# -------------------------------------------------
# Unexpected error logging
# -------------------------------------------------

# @app.exception_handler(Exception)
# async def global_exception_handler(
#     request: Request,
#     exc: Exception
# ):
#     logger.exception(
#         "Unhandled error | method=%s | path=%s | error=%s",
#         request.method,
#         request.url.path,
#         str(exc)
#     )

#     return JSONResponse(
#         status_code=500,
#         content={
#             "detail": "An unexpected server error occurred."
#         }
#     )

from fastapi import Request


@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception
):
    logger.exception(
        "Unhandled Exception | %s %s",
        request.method,
        request.url.path
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error."
        }
    )


# Keep normal HTTP errors unchanged.
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException
):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


# Keep Pydantic validation errors as 422 responses.
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors()
        }
    )


# -------------------------------------------------
# CORS
# -------------------------------------------------



import os

from fastapi.middleware.cors import CORSMiddleware

frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,

    # Allows Vercel preview deployment URLs such as:
    # https://gigora-xxxxx-suleman5.vercel.app
    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Routers
# -------------------------------------------------

app.include_router(payment.router)

app.include_router(auth_router)

app.include_router(
    proposal_router,
    prefix="/api/proposal",
    tags=["Proposal"]
)

app.include_router(
    seo_router,
    prefix="/api/seo",
    tags=["SEO"]
)

app.include_router(
    profile_router,
    prefix="/api/profile",
    tags=["Profile"]
)

app.include_router(
    history_router,
    prefix="/api/history",
    tags=["History"]
)

app.include_router(
    user_router,
    prefix="/api"
)

app.include_router(
    usage_router,
    prefix="/api/usage",
    tags=["Usage"]
)


