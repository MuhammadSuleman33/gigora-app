import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)


def analyze_profile(profile_text: str):
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": f"""
Analyze this freelancer profile.

Profile:
{profile_text}

Return ONLY valid JSON in this format:

{{
    "score": 7,
    "strengths": [
        "strength 1",
        "strength 2"
    ],
    "weaknesses": [
        "weakness 1",
        "weakness 2"
    ],
    "suggestions": [
        "suggestion 1",
        "suggestion 2"
    ]
}}
"""
                }
            ]
        )

        response = message.content[0].text

        return json.loads(response)

    except Exception as e:
        return {
            "score": 0,
            "strengths": [],
            "weaknesses": [],
            "suggestions": [],
            "error": str(e)
        }
    

def generate_proposal(job_post: str):
    pass

def optimize_gig(title: str, description: str):
    pass

# 