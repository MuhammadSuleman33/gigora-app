import concurrent.futures
import logging
import os
import re
import time
from typing import Any

import cohere
from dotenv import load_dotenv
from google import genai
from groq import Groq


load_dotenv()

logger = logging.getLogger("gigora")


# ======================================
# SETTINGS
# ======================================

MODEL_TIMEOUT_SECONDS = 10
MAX_PROPOSAL_WORDS = 500


# ======================================
# API KEYS
# ======================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")


def require_api_key(value: str | None, key_name: str) -> str:
    if not value:
        raise RuntimeError(
            f"{key_name} is missing from the environment."
        )

    return value


# ======================================
# CLIENTS WITH REQUEST TIMEOUTS
# ======================================

gemini_client = genai.Client(
    api_key=require_api_key(
        GEMINI_API_KEY,
        "GEMINI_API_KEY"
    ),
    http_options={
        # Google Gen AI timeout uses milliseconds.
        "timeout": MODEL_TIMEOUT_SECONDS * 1000
    }
)

groq_client = Groq(
    api_key=require_api_key(
        GROQ_API_KEY,
        "GROQ_API_KEY"
    ),
    timeout=float(MODEL_TIMEOUT_SECONDS),

    # Prevent automatic retries from extending the timeout.
    max_retries=0
)

cohere_client = cohere.ClientV2(
    api_key=require_api_key(
        COHERE_API_KEY,
        "COHERE_API_KEY"
    ),
    timeout=float(MODEL_TIMEOUT_SECONDS)
)


# ======================================
# RESULT HELPERS
# ======================================

def success_result(
    model: str,
    text: str,
    start_time: float
) -> dict[str, Any]:
    cleaned_text = (text or "").strip()

    if not cleaned_text:
        return failure_result(
            model=model,
            error="The model returned an empty response.",
            start_time=start_time
        )

    return {
        "model": model,
        "text": cleaned_text,
        "speed_ms": int(
            (time.time() - start_time) * 1000
        ),
        "success": True,
        "score": 0
    }


def failure_result(
    model: str,
    error: str,
    start_time: float | None = None
) -> dict[str, Any]:
    speed_ms = 0

    if start_time is not None:
        speed_ms = int(
            (time.time() - start_time) * 1000
        )

    logger.error(
        "AI model failed | model=%s | error=%s",
        model,
        error
    )

    return {
        "model": model,
        "text": "",
        "speed_ms": speed_ms,
        "success": False,
        "score": 0,
        "error": error
    }


# ======================================
# GEMINI
# ======================================

def call_gemini(prompt: str) -> dict[str, Any]:
    model_name = "Gemini 3.5 Flash"
    start = time.time()

    try:
        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        return success_result(
            model=model_name,
            text=response.text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=str(exc),
            start_time=start
        )


# ======================================
# GROQ
# ======================================

def call_groq(prompt: str) -> dict[str, Any]:
    model_name = "Llama 3 (Groq)"
    start = time.time()

    try:
        response = (
            groq_client
            .chat
            .completions
            .create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500
            )
        )

        text = response.choices[0].message.content

        return success_result(
            model=model_name,
            text=text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=str(exc),
            start_time=start
        )


# ======================================
# COHERE
# ======================================

def call_cohere(prompt: str) -> dict[str, Any]:
    model_name = "Command A+"
    start = time.time()

    try:
        response = cohere_client.chat(
            model="command-a-plus-05-2026",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=500
        )

        output_parts = []

        for item in response.message.content or []:
            item_text = getattr(item, "text", None)

            if item_text:
                output_parts.append(item_text)

        output_text = "".join(output_parts)

        return success_result(
            model=model_name,
            text=output_text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=str(exc),
            start_time=start
        )


# ======================================
# SCORING
# ======================================

def normalize_words(text: str) -> set[str]:
    return set(
        re.findall(
            r"\b[a-zA-Z0-9+#.]{3,}\b",
            text.lower()
        )
    )


def contains_phrase(
    text: str,
    phrases: list[str]
) -> bool:
    return any(
        phrase in text
        for phrase in phrases
    )


def score_proposal(
    proposal: str,
    job_post: str
) -> int:
    if not proposal or not proposal.strip():
        return 0

    score = 0
    proposal_lower = proposal.lower()
    words = proposal.split()
    word_count = len(words)

    # ----------------------------------
    # 1. Proposal length: 25 points
    # ----------------------------------

    if 120 <= word_count <= 180:
        score += 25
    elif 90 <= word_count < 120:
        score += 18
    elif 181 <= word_count <= 220:
        score += 15
    elif 60 <= word_count < 90:
        score += 10

    # ----------------------------------
    # 2. Job keyword match: 25 points
    # ----------------------------------

    job_keywords = {
        word
        for word in normalize_words(job_post)
        if len(word) > 4
    }

    proposal_keywords = normalize_words(proposal)

    matched_keywords = (
        job_keywords & proposal_keywords
    )

    score += min(
        len(matched_keywords) * 3,
        25
    )

    # ----------------------------------
    # 3. Greeting: 10 points
    # ----------------------------------

    first_words = proposal_lower[:60]

    greeting_patterns = [
        r"^\s*hi\b",
        r"^\s*hello\b",
        r"^\s*dear\b"
    ]

    if any(
        re.search(pattern, first_words)
        for pattern in greeting_patterns
    ):
        score += 10

    # ----------------------------------
    # 4. Experience: 15 points
    # ----------------------------------

    experience_words = [
        "experience",
        "worked",
        "developed",
        "built",
        "completed",
        "years"
    ]

    if contains_phrase(
        proposal_lower,
        experience_words
    ):
        score += 15

    # ----------------------------------
    # 5. Solution focus: 15 points
    # ----------------------------------

    solution_words = [
        "solution",
        "implement",
        "develop",
        "optimize",
        "fix",
        "integrate",
        "deliver"
    ]

    if contains_phrase(
        proposal_lower,
        solution_words
    ):
        score += 15

    # ----------------------------------
    # 6. Call to action: 10 points
    # ----------------------------------

    cta_words = [
        "let's discuss",
        "looking forward",
        "happy to discuss",
        "contact me",
        "message me",
        "discuss your project"
    ]

    if contains_phrase(
        proposal_lower,
        cta_words
    ):
        score += 10

    return min(score, 100)


# ======================================
# PROMPT
# ======================================

def build_prompt(
    job_post: str,
    tone: str,
    skill: str
) -> str:
    return f"""
You are a Top Rated {skill} freelancer on Upwork.

Write a proposal using a {tone} tone.

The proposal must sound like it was written by a real professional
freelancer, not by an AI.

Rules:
- Use a natural and human tone.
- Keep the proposal between 120 and 180 words.
- Start with a friendly greeting.
- Mention the client's specific problem.
- Explain briefly how you would solve it.
- Mention relevant experience naturally.
- Never exaggerate or make false claims.
- Avoid generic phrases such as:
  "I am the best candidate"
  "I am excited to apply"
  "I can do this perfectly"
- End with a short call to action.
- Do not use emojis.
- Do not use markdown.
- Do not use bullet points.
- Return only the proposal text.

Example Proposal 1:

Hi,

I recently completed a similar React dashboard project where I built
reusable components, optimized API calls, and improved loading
performance. After reading your requirements, I believe a clean and
scalable solution would work best for your application.

I'll build responsive components, keep the code organized, and ensure
everything integrates smoothly with your backend.

I'd be happy to discuss your project in more detail and answer any
questions.

Example Proposal 2:

Hello,

Your project caught my attention because it closely matches work I've
done before. I focus on writing clean, maintainable code and delivering
solutions that are easy to scale.

Instead of using a one-size-fits-all approach, I'll tailor the
implementation specifically to your project requirements and keep you
updated throughout development.

Let's discuss your goals and how I can help.

Job Post:

{job_post}
""".strip()


# ======================================
# MODEL COMPARISON
# ======================================

def compare_and_pick_best(
    job_post: str,
    tone: str,
    skill: str
) -> dict[str, Any]:
    prompt = build_prompt(
        job_post=job_post,
        tone=tone,
        skill=skill
    )

    model_functions = {
        "Gemini 3.5 Flash": call_gemini,
        "Llama 3 (Groq)": call_groq,
        "Command A+": call_cohere,
    }

    executor = concurrent.futures.ThreadPoolExecutor(
        max_workers=len(model_functions)
    )

    future_to_model = {
        executor.submit(model_function, prompt): model_name
        for model_name, model_function
        in model_functions.items()
    }

    completed_results: list[dict[str, Any]] = []

    try:
        done, not_done = concurrent.futures.wait(
            future_to_model,
            timeout=MODEL_TIMEOUT_SECONDS
        )

        # Process completed requests
        for future in done:
            model_name = future_to_model[future]

            try:
                result = future.result()

                # Score only successful responses
                if (
                    result.get("success") is True
                    and result.get("text", "").strip()
                ):
                    result["score"] = score_proposal(
                        proposal=result["text"],
                        job_post=job_post
                    )

                    logger.info(
                        (
                            "AI model completed | "
                            "model=%s | score=%s | "
                            "speed_ms=%s | words=%s"
                        ),
                        model_name,
                        result["score"],
                        result.get("speed_ms", 0),
                        len(result["text"].split())
                    )
                else:
                    result["success"] = False
                    result["score"] = 0

                    if not result.get("error"):
                        result["error"] = (
                            "The model did not return a valid proposal."
                        )

                completed_results.append(result)

            except Exception as exc:
                completed_results.append(
                    failure_result(
                        model=model_name,
                        error=str(exc)
                    )
                )

        # Mark requests that exceeded the global timeout
        for future in not_done:
            model_name = future_to_model[future]

            future.cancel()

            completed_results.append(
                failure_result(
                    model=model_name,
                    error=(
                        f"Model exceeded the "
                        f"{MODEL_TIMEOUT_SECONDS}-second timeout."
                    )
                )
            )

    finally:
        # Do not wait for timed-out background requests
        executor.shutdown(
            wait=False,
            cancel_futures=True
        )

    model_order = [
        "Gemini 3.5 Flash",
        "Llama 3 (Groq)",
        "Command A+",
    ]

    completed_results.sort(
        key=lambda item: (
            model_order.index(item["model"])
            if item.get("model") in model_order
            else len(model_order)
        )
    )

    # Only successful models belong in all_results
    successful_results = [
        result
        for result in completed_results
        if (
            result.get("success") is True
            and result.get("text", "").strip()
        )
    ]

    # Sort successful proposals by score
    successful_results.sort(
        key=lambda item: (
            item.get("score", 0),
            -item.get("speed_ms", 0)
        ),
        reverse=True
    )

    # Only failed models belong here
    failed_models = [
        {
            "model": result.get(
                "model",
                "Unknown model"
            ),
            "error": result.get(
                "error",
                "Unknown model error."
            ),
            "speed_ms": result.get(
                "speed_ms",
                0
            ),
        }
        for result in completed_results
        if result.get("success") is not True
    ]

    # Summary containing every model
    comparison = [
        {
            "model": result.get(
                "model",
                "Unknown model"
            ),
            "score": result.get("score", 0),
            "speed_ms": result.get(
                "speed_ms",
                0
            ),
            "success": result.get(
                "success",
                False
            ),
        }
        for result in completed_results
    ]

    if not successful_results:
        return {
            "best_model": None,
            "best_score": 0,
            "best_proposal": "",
            "comparison": comparison,

            # Important: failed models are no longer
            # returned inside all_results
            "all_results": [],

            "failed_models": failed_models,
            "message": (
                "All AI services failed or exceeded "
                "the response timeout. Please try again."
            ),
        }

    best = successful_results[0]

    return {
        "best_model": best["model"],
        "best_score": best["score"],
        "best_proposal": best["text"],
        "comparison": comparison,

        # Contains successful proposals only
        "all_results": successful_results,

        # Contains failed models only
        "failed_models": failed_models,
    }

# ======================================
# LOCAL TEST
# ======================================

if __name__ == "__main__":
    from pprint import pprint

    test_result = compare_and_pick_best(
        job_post=(
            "Need a React developer to build a responsive "
            "analytics dashboard connected to a FastAPI backend."
        ),
        tone="professional",
        skill="React Developer"
    )

    pprint(test_result)