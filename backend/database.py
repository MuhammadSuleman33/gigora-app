from supabase import create_client
import os

from dotenv import load_dotenv
import os

load_dotenv()

print("SUPABASE_URL =", os.getenv("SUPABASE_URL"))
print("SUPABASE_KEY =", os.getenv("SUPABASE_KEY"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)