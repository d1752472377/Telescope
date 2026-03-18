import hashlib

from cryptography.fernet import Fernet

from app.config import ENCRYPTION_KEY

_generated_key: str | None = None

if ENCRYPTION_KEY:
    _key = ENCRYPTION_KEY.encode()
else:
    _generated_key = Fernet.generate_key().decode()
    _key = _generated_key.encode()
    print('ENCRYPTION_KEY is not set. Generated a temporary development key:')
    print(_generated_key)
    print('Add this value to backend/.env before using persistent encrypted data.')

_cipher = Fernet(_key)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def encrypt(text: str | None) -> str | None:
    if not text:
        return text
    return _cipher.encrypt(text.encode('utf-8')).decode('utf-8')


def decrypt(token: str | None) -> str | None:
    if not token:
        return token
    return _cipher.decrypt(token.encode('utf-8')).decode('utf-8')
