import concurrent.futures
import logging
import os
import re
import time
from typing import Any, Callable

from dotenv import load_dotenv
from google import genai
from google.genai import types
from groq import Groq
import cohere


load_dotenv()

logger = logging.getLogger("gigora")


# ======================================
# SETTINGS
# ======================================

# Individual SDK request timeout
MODEL_REQUEST_TIMEOUT_SECONDS = 55

# Overall time allowed for all models
GLOBAL_TIMEOUT_SECONDS = 60

# Provider-specific output token limits.
# Gemini may use part of its output budget for internal reasoning.
# Groq uses a smaller limit because the requested proposal
# is only 120-180 words.
GEMINI_MAX_OUTPUT_TOKENS = 1600
GROQ_MAX_OUTPUT_TOKENS = 500
COHERE_MAX_OUTPUT_TOKENS = 2000


# ======================================
# MODEL NAMES
# ======================================

# These can be overridden through .env
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)

COHERE_MODEL = os.getenv(
    "COHERE_MODEL",
    "command-r-08-2024"
)


# ======================================
# API KEYS
# ======================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")


def require_api_key(
    value: str | None,
    key_name: str
) -> str:
    """
    Validate that an API key exists.
    """

    if not value or not value.strip():
        raise RuntimeError(
            f"{key_name} is missing from the environment."
        )

    return value.strip()


# ======================================
# CLIENTS
# ======================================

gemini_client = genai.Client(
    api_key=require_api_key(
        GEMINI_API_KEY,
        "GEMINI_API_KEY"
    ),
    http_options=types.HttpOptions(
        # Gemini timeout is measured in milliseconds.
        timeout=MODEL_REQUEST_TIMEOUT_SECONDS * 1000
    )
)


groq_client = Groq(
    api_key=require_api_key(
        GROQ_API_KEY,
        "GROQ_API_KEY"
    ),
    timeout=float(
        MODEL_REQUEST_TIMEOUT_SECONDS
    ),
    max_retries=1
)

cohere_client = cohere.ClientV2(
    api_key=require_api_key(
        COHERE_API_KEY,
        "COHERE_API_KEY"
    ),
    base_url="https://api.cohere.com",
    timeout=MODEL_REQUEST_TIMEOUT_SECONDS
)


# ======================================
# RESULT HELPERS
# ======================================

def success_result(
    model: str,
    text: str | None,
    start_time: float
) -> dict[str, Any]:
    """
    Create a standard successful model result.
    """

    cleaned_text = str(text or "").strip()

    if not cleaned_text:
        return failure_result(
            model=model,
            error="The model returned an empty response.",
            start_time=start_time
        )

    word_count = len(cleaned_text.split())

    if word_count < 60:
        return failure_result(
            model=model,
            error=(
                "The model returned an incomplete proposal "
                f"containing only {word_count} words."
            ),
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
    """
    Create a standard failed model result.
    """

    speed_ms = 0

    if start_time is not None:
        speed_ms = int(
            (time.time() - start_time) * 1000
        )

    cleaned_error = (
        str(error).strip()
        or "Unknown AI model error."
    )

    logger.error(
        "AI model failed | model=%s | speed_ms=%s | error=%s",
        model,
        speed_ms,
        cleaned_error
    )

    return {
        "model": model,
        "text": "",
        "speed_ms": speed_ms,
        "success": False,
        "score": 0,
        "error": cleaned_error
    }


def format_exception(exc: Exception) -> str:
    """
    Include the exception class so logs show whether
    the issue is a timeout, authentication error,
    rate limit, invalid model, or another API error.
    """

    return f"{type(exc).__name__}: {exc}"


# ======================================
# GEMINI
# ======================================

def extract_gemini_text(response: Any) -> str:
    """
    Safely extract text from a Gemini response.
    """

    try:
        direct_text = getattr(
            response,
            "text",
            None
        )

        if direct_text:
            return str(direct_text).strip()

    except Exception as exc:
        logger.warning(
            "Unable to read Gemini response.text | error=%s",
            format_exception(exc)
        )

    output_parts: list[str] = []

    candidates = getattr(
        response,
        "candidates",
        None
    ) or []

    for candidate in candidates:
        content = getattr(
            candidate,
            "content",
            None
        )

        parts = getattr(
            content,
            "parts",
            None
        ) or []

        for part in parts:
            part_text = getattr(
                part,
                "text",
                None
            )

            if part_text:
                output_parts.append(
                    str(part_text)
                )

    return "\n".join(output_parts).strip()


def call_gemini(
    prompt: str
) -> dict[str, Any]:
    model_name = "Gemini 3.6 Flash"
    start = time.time()

    try:
        response = (
            gemini_client
            .models
            .generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=GEMINI_MAX_OUTPUT_TOKENS
                )
            )
        )

        output_text = extract_gemini_text(
            response
        )

        finish_reason = None

        candidates = getattr(
            response,
            "candidates",
            None
        ) or []

        if candidates:
            finish_reason = getattr(
                candidates[0],
                "finish_reason",
                None
            )

        word_count = len(
            output_text.split()
        )

        if word_count < 60:
            return failure_result(
                model=model_name,
                error=(
                    "Gemini returned an incomplete response. "
                    f"Words: {word_count}, "
                    f"finish_reason: {finish_reason}"
                ),
                start_time=start
            )

        return success_result(
            model=model_name,
            text=output_text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=format_exception(exc),
            start_time=start
        )


# ======================================
# GROQ
# ======================================

def call_groq(
    prompt: str
) -> dict[str, Any]:
    model_name = "Llama 3.3 (Groq)"
    start = time.time()

    try:
        response = (
            groq_client
            .chat
            .completions
            .create(
                model=GROQ_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=GROQ_MAX_OUTPUT_TOKENS
            )
        )

        if not response.choices:
            return failure_result(
                model=model_name,
                error=(
                    "Groq returned no completion choices."
                ),
                start_time=start
            )

        text = (
            response
            .choices[0]
            .message
            .content
        )

        return success_result(
            model=model_name,
            text=text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=format_exception(exc),
            start_time=start
        )



# ======================================
# COHERE
# ======================================

def extract_cohere_text(response: Any) -> str:
    """
    Safely extract text from a Cohere Chat API v2 response.
    """

    message = getattr(response, "message", None)
    content = getattr(message, "content", None) or []

    output_parts: list[str] = []

    for item in content:
        item_text = getattr(item, "text", None)

        if item_text:
            output_parts.append(str(item_text))

    return "\n".join(output_parts).strip()


def call_cohere(
    prompt: str
) -> dict[str, Any]:
    model_name = f"{COHERE_MODEL} (Cohere)"
    start = time.time()

    try:
        response = cohere_client.chat(
    model=COHERE_MODEL,
    messages=[
        {
            "role": "system",
            "content": (
                "Write only the final proposal. "
                "Do not provide reasoning, analysis, notes, or explanations."
            )
        },
        {
            "role": "user",
            "content": prompt
        }
    ],
    temperature=0.4,
    max_tokens=COHERE_MAX_OUTPUT_TOKENS
)

        output_text = extract_cohere_text(response)
        finish_reason = getattr(response, "finish_reason", None)
        word_count = len(output_text.split())

        if word_count < 60:
            return failure_result(
                model=model_name,
                error=(
                    "Cohere returned an incomplete response. "
                    f"Words: {word_count}, "
                    f"finish_reason: {finish_reason}"
                ),
                start_time=start
            )

        return success_result(
            model=model_name,
            text=output_text,
            start_time=start
        )

    except Exception as exc:
        return failure_result(
            model=model_name,
            error=format_exception(exc),
            start_time=start
        )


# ======================================
# SCORING
# ======================================

def normalize_words(
    text: str
) -> set[str]:
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

    proposal_keywords = normalize_words(
        proposal
    )

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
    cleaned_job_post = job_post.strip()
    cleaned_tone = tone.strip() or "professional"
    cleaned_skill = skill.strip() or "software developer"

    return f"""
You are a Top Rated {cleaned_skill} freelancer on Upwork.

Write a proposal using a {cleaned_tone} tone.

The proposal must sound like it was written by a real professional
freelancer, not by an AI.

Rules:
- Use a natural and human tone.
- Keep the proposal between 120 and 180 words.
- Start with a friendly greeting.
- Mention the client's specific problem.
- Explain briefly how you would solve it.
- Mention relevant experience only when it is supported by the information provided.
- Never invent clients, projects, percentages, years of experience,
  certifications, statistics, or achievements.
- If verified experience is not provided, focus on the technical approach
  without claiming a previous client project.
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

Example style:

Hi,

Your project requires a responsive React dashboard that communicates
reliably with a FastAPI backend. I would structure the interface with
reusable components, implement clear loading and error states, and keep
API integration organized through a dedicated service layer.

The dashboard would be optimized for desktop and mobile screens, while
state management and data fetching would be designed to avoid unnecessary
requests and re-renders. I would also keep the code modular so future
charts, filters, and reporting features can be added cleanly.

I would be happy to review your API structure and dashboard requirements
before confirming the implementation plan. Let's discuss the details.

Job Post:

{cleaned_job_post}
""".strip()


# ======================================
# MODEL COMPARISON
# ======================================

def compare_and_pick_best(
    job_post: str,
    tone: str,
    skill: str
) -> dict[str, Any]:
    """
    Run all configured models concurrently, score successful
    proposals, and return the best result.
    """

    cleaned_job_post = job_post.strip()

    if not cleaned_job_post:
        raise ValueError(
            "The job post cannot be empty."
        )

    prompt = build_prompt(
        job_post=cleaned_job_post,
        tone=tone,
        skill=skill
    )

    model_functions: dict[
        str,
        Callable[[str], dict[str, Any]]
    ] = {
        "Gemini 3.6 Flash": call_gemini,
        "Llama 3.3 (Groq)": call_groq,
        "Command R (Cohere)": call_cohere,
    }

    executor = concurrent.futures.ThreadPoolExecutor(
        max_workers=len(model_functions)
    )

    future_to_model = {
        executor.submit(
            model_function,
            prompt
        ): model_name
        for model_name, model_function
        in model_functions.items()
    }

    completed_results: list[
        dict[str, Any]
    ] = []

    try:
        done, not_done = concurrent.futures.wait(
            future_to_model,
            timeout=GLOBAL_TIMEOUT_SECONDS
        )

        # Process completed model calls
        for future in done:
            model_name = future_to_model[future]

            try:
                result = future.result()

                if (
                    result.get("success") is True
                    and result.get("text", "").strip()
                ):
                    result["score"] = score_proposal(
                        proposal=result["text"],
                        job_post=cleaned_job_post
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
                            "The model did not return "
                            "a valid proposal."
                        )

                completed_results.append(
                    result
                )

            except Exception as exc:
                completed_results.append(
                    failure_result(
                        model=model_name,
                        error=format_exception(exc)
                    )
                )

        # Mark unfinished requests as timed out
        for future in not_done:
            model_name = future_to_model[future]

            future.cancel()

            completed_results.append(
                failure_result(
                    model=model_name,
                    error=(
                        "Model exceeded the global "
                        f"{GLOBAL_TIMEOUT_SECONDS}-second "
                        "timeout."
                    )
                )
            )

    finally:
        executor.shutdown(
            wait=False,
            cancel_futures=True
        )

    model_order = [
        "Gemini 3.6 Flash",
        "Llama 3.3 (Groq)",
        "Command R (Cohere)",
    ]

    completed_results.sort(
        key=lambda item: (
            model_order.index(item["model"])
            if item.get("model") in model_order
            else len(model_order)
        )
    )

    successful_results = [
        result
        for result in completed_results
        if (
            result.get("success") is True
            and result.get("text", "").strip()
        )
    ]

    successful_results.sort(
        key=lambda item: (
            item.get("score", 0),
            -item.get("speed_ms", 0)
        ),
        reverse=True
    )

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

    comparison = [
        {
            "model": result.get(
                "model",
                "Unknown model"
            ),
            "score": result.get(
                "score",
                0
            ),
            "speed_ms": result.get(
                "speed_ms",
                0
            ),
            "success": result.get(
                "success",
                False
            ),
            "error": result.get(
                "error"
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
        "all_results": successful_results,
        "failed_models": failed_models,
    }


# ======================================
# LOCAL TEST
# ======================================

if __name__ == "__main__":
    from pprint import pprint

    test_prompt = build_prompt(
        job_post=(
            "Need a React developer to build a responsive "
            "analytics dashboard connected to a FastAPI "
            "backend."
        ),
        tone="professional",
        skill="React Developer"
    )

    # print("\n================================")
    # print("Testing Gemini")
    # print("================================")
    # pprint(call_gemini(test_prompt))

    # print("\n================================")
    # print("Testing Groq")
    # print("================================")
    # pprint(call_groq(test_prompt))

    print("\n================================")
    print("Testing Cohere")
    print("================================")
    pprint(call_cohere(test_prompt))

    print("\n================================")
    print("Testing complete comparison")
    print("================================")

    test_result = compare_and_pick_best(
        job_post=(
            "Need a React developer to build a responsive "
            "analytics dashboard connected to a FastAPI "
            "backend."
        ),
        tone="professional",
        skill="React Developer"
    )

    pprint(test_result)
