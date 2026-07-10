from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from ai_service import analyze_profile
from routes.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import (
    generate_proposal,
    optimize_gig,
    analyze_profile
)

app = FastAPI()
class ProposalRequest(BaseModel):
    job_post: str


class GigRequest(BaseModel):
    title: str
    description: str


class ProfileRequest(BaseModel):
    profile_text: str


@app.post("/api/proposal")
def create_proposal(data: ProposalRequest):
    result = generate_proposal(data.job_post)

    return {
        "proposal": result
    }


@app.post("/api/seo")
def seo(data: GigRequest):
    result = optimize_gig(
        data.title,
        data.description
    )

    return {
        "optimized_gig": result
    }



@app.post("/api/profile")
def profile_analyzer(data: ProfileRequest):
    try:
        return analyze_profile(data.profile_text)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
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