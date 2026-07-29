import os
from dotenv import load_dotenv
from supabase import create_client

# Load .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Check that variables exist
if not SUPABASE_URL:
    raise Exception("SUPABASE_URL not found")

if not SUPABASE_KEY:
    raise Exception("SUPABASE_KEY not found")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise Exception("SUPABASE_SERVICE_ROLE_KEY not found")

# Normal client
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# Admin client
supabase_admin = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)