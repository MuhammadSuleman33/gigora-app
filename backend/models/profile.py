from pydantic import BaseModel


class ProfileRequest(BaseModel):
    profile_text: str