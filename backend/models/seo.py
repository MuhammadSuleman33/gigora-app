from pydantic import BaseModel


class GigRequest(BaseModel):
    title: str
    description: str
    category: str