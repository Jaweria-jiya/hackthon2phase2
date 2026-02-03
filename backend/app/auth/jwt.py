from jose import JWTError, jwt
from datetime import datetime
from app.config import settings


def verify_token(token: str) -> dict:
    """
    Verify JWT token and return payload.

    Args:
        token: JWT token string

    Returns:
        dict: Token payload containing user_id, email, iat, exp

    Raises:
        ValueError: If token is invalid, expired, or has wrong signature
    """
    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Check expiration
        exp = payload.get("exp")
        if exp:
            exp_datetime = datetime.fromtimestamp(exp)
            if exp_datetime < datetime.utcnow():
                raise JWTError("Token expired")

        # Verify required claims exist
        if "sub" not in payload:
            raise JWTError("Missing user_id in token")

        return payload

    except JWTError as e:
        raise ValueError(f"Invalid token: {str(e)}")
