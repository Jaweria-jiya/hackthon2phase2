from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt import verify_token


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Extract and verify JWT token, return user_id.

    This dependency:
    - Extracts token from Authorization: Bearer header
    - Verifies token signature using BETTER_AUTH_SECRET
    - Checks token expiration
    - Returns authenticated user_id from 'sub' claim

    Args:
        credentials: HTTP Bearer token from Authorization header

    Returns:
        str: Authenticated user_id (UUID as string)

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )

        return user_id

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )


def verify_user_access(
    user_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Verify URL user_id matches authenticated user_id.

    This dependency ensures users can only access their own resources.
    It compares the user_id from the URL path with the user_id from
    the JWT token.

    Args:
        user_id: User ID from URL path parameter
        current_user: Authenticated user ID from JWT token

    Raises:
        HTTPException 403: If user_id doesn't match authenticated user
    """
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user_id mismatch"
        )
