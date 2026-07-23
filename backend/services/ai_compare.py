import os
import time
import concurrent.futures

from dotenv import load_dotenv
from google import genai
from groq import Groq
import cohere

load_dotenv()

# ======================================
# API KEYS
# ======================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

# ======================================
# CLIENTS
# ======================================

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)
cohere_client = cohere.Client(COHERE_API_KEY)


# ==========================
# Gemini
# ==========================

def call_gemini(prompt: str) -> dict:
    start = time.time()

    try:
        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
        )

        return {
            "model": "Gemini 3.5 Flash",
            "text": response.text,
            "speed_ms": int((time.time() - start) * 1000),
            "success": True,
        }

    except Exception as e:
        return {
            "model": "Gemini 3.5 Flash",
            "text": "",
            "speed_ms": 0,
            "success": False,
            "error": str(e),
        }


# ==========================
# Groq
# ==========================

def call_groq(prompt: str) -> dict:
    start = time.time()

    try:
        response = groq_client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": prompt
        }
    ],
    max_tokens=500
)

        return {
            "model": "Llama 3 (Groq)",
            "text": response.choices[0].message.content,
            "speed_ms": int((time.time() - start) * 1000),
            "success": True,
        }

    except Exception as e:
        return {
            "model": "Llama 3 (Groq)",
            "text": "",
            "speed_ms": 0,
            "success": False,
            "error": str(e),
        }


# ==========================
# Cohere
# ==========================

def call_cohere(prompt: str) -> dict:
    start = time.time()

    try:
        response = cohere_client.v2.chat(
            model="command-a-plus-05-2026",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract the assistant text safely
        output_text = ""

        for item in response.message.content:
            if hasattr(item, "text"):
                output_text += item.text

        return {
            "model": "Command A+",
            "text": output_text,
            "speed_ms": int((time.time() - start) * 1000),
            "success": True,
        }

    except Exception as e:
        return {
            "model": "Command A+",
            "text": "",
            "speed_ms": 0,
            "success": False,
            "error": str(e),
        }


def score_proposal(proposal: str, job_post: str) -> int:

    score = 0

    proposal_lower = proposal.lower()
    job_lower = job_post.lower()

    # proposal length
    words = len(proposal.split())

    if 120 <= words <= 220:
        score += 30
    elif words >= 80:
        score += 20

    # keyword matching
    keywords = job_lower.split()

    matched = 0

    for word in keywords:
        if len(word) > 4 and word in proposal_lower:
            matched += 1

    score += min(matched * 3, 30)

    # CTA
    if (
        "let's" in proposal_lower
        or "looking forward" in proposal_lower
        or "contact" in proposal_lower
    ):
        score += 20

    # greeting
    if (
        "hi" in proposal_lower
        or "hello" in proposal_lower
    ):
        score += 20

    return min(score, 100)


def compare_and_pick_best(
    job_post: str,
    tone: str,
    skill: str
):
    prompt = f"""
You are a {skill} freelancer.

Write a {tone} Upwork proposal.

Job Post:
{job_post}
"""

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:

        futures = [
            executor.submit(call_gemini, prompt),
            executor.submit(call_groq, prompt),
            executor.submit(call_cohere, prompt),
        ]

        # Wait up to 10 seconds
        done, not_done = concurrent.futures.wait(
            futures,
            timeout=10
        )

        results = []

        # Process completed tasks
        for future in done:
            try:
                result = future.result()

                if result["success"]:
                    result["score"] = score_proposal(
                        result["text"],
                        job_post
                    )
                    results.append(result)

            except Exception as e:
                print("Model Error:", e)

        # Cancel unfinished tasks
        for future in not_done:
            future.cancel()

    # If no model returned successfully
    if not results:
        raise Exception(
            "All AI services are busy. Please try again in a minute."
        )

    # Select the highest-scoring proposal
    best = max(
        results,
        key=lambda x: x["score"]
    )

    return {
        "best_model": best["model"],
        "best_score": best["score"],
        "best_proposal": best["text"],
        "all_results": results,
    }

if __name__ == "__main__":

    result = compare_and_pick_best(
        job_post="Need a React developer for dashboard.",
        tone="professional",
        skill="React Developer"
    )

    from pprint import pprint
    pprint(result)




