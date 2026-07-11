import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-3.5-flash"
)


def analyze_profile(profile_text: str):
    prompt = f"""
    Analyze this freelancer profile and return JSON only.

    Profile:
    {profile_text}

    Return exactly:

    {{
      "score": 7,
      "strengths": [],
      "weaknesses": [],
      "suggestions": []
    }}
    """

    response = model.generate_content(prompt)

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    return json.loads(text)


def generate_proposal(job_post: str):
    prompt = f"""
    You are an expert freelancer proposal writer.

    Write a professional proposal for:

    {job_post}

    Keep it under 200 words.
    """

    response = model.generate_content(prompt)

    return response.text


def optimize_gig(title: str, description: str):
    prompt = f"""
    Optimize this Fiverr gig.

    Title:
    {title}

    Description:
    {description}

    Return:

    Optimized Title:
    Optimized Description:
    SEO Keywords:
    """

    response = model.generate_content(prompt)

    return response.text