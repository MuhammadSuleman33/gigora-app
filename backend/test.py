from database import supabase

response = (
    supabase.table("proposals")
    .select("*")
    .order("created_at", desc=True)
    .execute()
)

print(response.data)