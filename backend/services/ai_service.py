from google import genai
from services.history_service import save_history
import os
import json
from dotenv import load_dotenv

load_dotenv()

API_KEYS = [
    os.getenv("GEMINI_API_KEY"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
]

MODEL_NAME = "gemini-3.5-flash"

def get_client(api_key):
    return genai.Client(api_key=api_key)


def generate_with_rotation(prompt):
    last_error = None

    for key in API_KEYS:
        if not key:
            continue

        try:
            client = get_client(key)

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )

            print(f"Using API key: {key[:10]}...")
            return response

        except Exception as e:
            last_error = e
            error = str(e).lower()

            print(f"Key failed: {e}")

            if (
                "429" in error
                or "quota" in error
                or "resource_exhausted" in error
            ):
                print("Switching to next API key...")
                continue

            raise e

    raise Exception(
        f"All Gemini API keys are exhausted. Last error: {last_error}"
    )


def analyze_profile(profile_text, current_user):
    prompt = f"""
Analyze this freelancer profile and return JSON only.

Profile:
{profile_text}

Return exactly:

{{
  "score": 7,
  "strengths": [
  "example strength"
],
"weaknesses": [
  "example weakness"
],
"suggestions": [
  "example suggestion"
]
Do not return empty arrays. Always provide meaningful points.
}}
"""

    response = generate_with_rotation(prompt)

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    result = json.loads(text)

    save_history(
        current_user["id"],
        "profile",
        {
            "profile_text": profile_text
        },
        result
    )

    return result

def generate_proposal(
    job_post,
    tone,
    skill,
    platform,
    length,
    current_user=None
):

    word_limits = {
        "short": 100,
        "medium": 200,
        "long": 300
    }

    words = word_limits.get(length, 200)

    prompt = f"""
You are an expert {skill} freelancer on {platform}.

Write a {tone} proposal under {words} words.

Job Post:
{job_post}

Return JSON only:

{{
  "proposal":"text",
  "word_count":180,
  "key_points":[
      "point1",
      "point2",
      "point3"
  ]
}}
"""

    response = generate_with_rotation(prompt)

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    result = json.loads(text)


    proposal = result.get("proposal", "")
    key_points = result.get("key_points", [])


    # Save history only for logged-in users
    if current_user and current_user.get("id"):

        save_history(
            current_user["id"],
            "proposal",
            {
                "job_post": job_post,
                "tone": tone,
                "skill": skill,
                "platform": platform,
                "length": length
            },
            result
        )


    return {
        "proposal": proposal,
        "key_points": key_points
    }

def optimize_gig(
    title: str,
    description: str,
    category: str,
    current_user
):
    prompt = f"""
You are a Fiverr SEO expert.

Category:
{category}

Title:
{title}

Description:
{description}

Return JSON only in this format:

{{
  "optimized_title": "",
  "tags": [
    "tag one",
    "tag two",
    "tag three",
    "tag four",
    "tag five"
  ],
  "optimized_description": "",
  "tips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}}
"""

    response = generate_with_rotation(prompt)

    text = (
        response.text
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    print("Gemini Response:")
    print(text)

    try:
        result = json.loads(text)
    except Exception as e:
        print("JSON Error:", e)
        raise

    try:
        save_history(
            current_user["id"],
            "seo",
            {
                "title": title,
                "description": description,
                "category": category
            },
            result
        )
    except Exception as e:
        print("History Error:", e)
        raise

    # Validate tags
    validated_tags = []

    for tag in result.get("tags", []):
        words = tag.split()

        valid = (
            2 <= len(words) <= 5
            and len(tag) <= 20
        )

        validated_tags.append({
            "text": tag,
            "valid": valid
        })

    result["tags"] = validated_tags

    # Scores
    title_score = (
        10
        if len(result["optimized_title"]) <= 80
        else 5
    )

    valid_tags_count = len(
        [t for t in validated_tags if t["valid"]]
    )

    tag_score = min(valid_tags_count * 2, 10)

    desc_length = len(result["optimized_description"])

    if desc_length >= 300:
        desc_score = 10
    elif desc_length >= 150:
        desc_score = 8
    else:
        desc_score = 5

    overall = round(
        (title_score + tag_score + desc_score) / 3
    )

    result["scores"] = {
        "title": title_score,
        "tags": tag_score,
        "description": desc_score,
        "overall": overall
    }

    return result