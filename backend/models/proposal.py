from pydantic import BaseModel

class ProposalRequest(BaseModel):
    job_post: str
    tone: str = "professional"
    skill: str = ""
    platform: str = "Fiverr"
    length: str = "medium"