import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / '.env'

load_dotenv(ENV_PATH)

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./telescope.db')
SECRET_KEY = os.getenv('SECRET_KEY', 'change-me-in-development')
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY', '')
