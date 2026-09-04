from supabase import create_client
from app.config import get_settings


settings = get_settings()

supabase = create_client(
    settings.supabase_url,
    settings.supabase_publishable_key,
)

email = input("Supabase email: ")
password = input("Supabase password: ")

response = supabase.auth.sign_in_with_password({
    "email": email,
    "password": password,
})

if response.session is None:
    raise RuntimeError("Login succeeded but no session was returned.")

print("\nACCESS TOKEN:\n")
print(response.session.access_token)