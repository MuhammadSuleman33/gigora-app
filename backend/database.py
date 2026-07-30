import os

from dotenv import load_dotenv
from supabase import Client, create_client


# -------------------------------------------------
# Environment configuration
# -------------------------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv(
    "SUPABASE_SERVICE_ROLE_KEY"
)


# -------------------------------------------------
# Environment validation
# -------------------------------------------------

required_variables = {
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_KEY": SUPABASE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY": SUPABASE_SERVICE_ROLE_KEY,
}

missing_variables = [
    variable_name
    for variable_name, variable_value in required_variables.items()
    if not variable_value
]

if missing_variables:
    raise RuntimeError(
        "Missing required environment variables: "
        + ", ".join(missing_variables)
    )


# -------------------------------------------------
# Supabase clients
# -------------------------------------------------

# Normal client:
# Use for standard authenticated user operations.
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)

# Admin client:
# Bypasses Row Level Security.
# Use only for trusted backend operations such as:
# - verified Stripe webhook updates
# - administrative maintenance
# - server-controlled account recovery
supabase_admin: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
)