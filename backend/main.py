from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from auth import router as auth_router
from routes.proposal import router as proposal_router
from routes.seo import router as seo_router
from routes.profile import router as profile_router
from routes.history import router as history_router
from routes.user import router as user_router
from routes.usage import router as usage_router
from rate_limiter import limiter
from routes import payment



app = FastAPI()
app.include_router(payment.router)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please wait a minute and try again."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.100.113:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


