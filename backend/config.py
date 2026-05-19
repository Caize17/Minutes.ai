import os
from dotenv import load_dotenv

# Load root .env.local file if it exists, otherwise standard .env
root_env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(root_env_path):
    load_dotenv(root_env_path)
else:
    load_dotenv()

# ==========================================
# CONFIGURATION & CREDENTIALS
# ==========================================
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDb49ZHh4-5LA3iC1o7YTSA6omhpizwBoo")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "[EMAIL_ADDRESS]")
APP_PASSWORD = os.environ.get("APP_PASSWORD", "mtkm ifdg qxmb rmvh")
