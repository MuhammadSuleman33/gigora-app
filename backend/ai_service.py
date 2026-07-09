import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY")
)


# Purposal

def generate_proposal(job_post: str) -> str:
    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": f"""
You are an expert freelancer.

Write a professional proposal for this job:

{job_post}

Rules:
- Under 200 words
- Professional tone
- Mention experience
- Include call to action
"""
                }
            ]
        )

        return message.content[0].text

    except Exception as e:
        return str(e)
    

# Gig Optimization

def optimize_gig(title: str, description: str):
    try:
        prompt = f"""
Improve this Fiverr gig.

Title:
{title}

Description:
{description}

Make it:
- SEO Friendly
- Professional
- High converting
"""

        message = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=800,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return message.content[0].text

    except Exception as e:
        return str(e)
    

# analyzing 

def analyze_profile(profile_text: str):
    try:
        prompt = f"""
Analyze this freelancer profile.

Profile:
{profile_text}

Give:
1. Strengths
2. Weaknesses
3. SEO Score
4. Suggestions
"""

        message = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return message.content[0].text

    except Exception as e:
        return str(e)    