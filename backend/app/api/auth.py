"""
Production-ready authentication endpoints with proper async SQLAlchemy 2.x.
Uses session.execute() + result.scalars().first() pattern.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from pydantic import BaseModel, EmailStr, Field, validator
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import logging
import re

from app.database import get_session
from app.models.user import User
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class SignupRequest(BaseModel):
    """Request model for user signup with validation."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @validator('password')
    def validate_password_strength(cls, v):
        """Enforce strong password policy."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v


class SignupResponse(BaseModel):
    """Response model for user signup."""
    user_id: str
    email: str
    message: str


class LoginRequest(BaseModel):
    """Request model for user login."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Response model for user login."""
    user_id: str
    email: str
    token: str


# ============================================================================
# SIGNUP ENDPOINT - PRODUCTION READY
# ============================================================================

@router.post(
    "/signup",
    response_model=SignupResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {
            "description": "User created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "user_id": "1",
                        "email": "user@example.com",
                        "message": "Account created successfully"
                    }
                }
            }
        },
        400: {
            "description": "Email already registered",
            "content": {
                "application/json": {
                    "example": {"detail": "Email already registered"}
                }
            }
        },
        422: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {"detail": "Password must be at least 8 characters"}
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "An error occurred during registration"}
                }
            }
        }
    }
)
async def signup(
    request: SignupRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Create a new user account.

    ✅ PRODUCTION-READY ASYNC SQLALCHEMY 2.X PATTERN:
    - Uses await session.execute() (not exec)
    - Uses result.scalars().first() for proper extraction
    - Comprehensive error handling with rollback
    - Proper logging for monitoring
    - HTTP status codes for all scenarios
    """
    try:
        # ✅ CORRECT: Pure SQLAlchemy 2.x async pattern
        # Step 1: Execute query and await the coroutine
        result = await session.execute(
            select(User).where(User.email == request.email)
        )

        # Step 2: Extract scalar result (single User object or None)
        existing_user = result.scalars().first()

        if existing_user:
            logger.warning(
                f"Signup attempt with existing email: {request.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash password with bcrypt (cost factor 12 for security)
        password_bytes = request.password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

        # Create new user instance
        new_user = User(
            email=request.email,
            password_hash=password_hash
        )

        # Add to session and commit
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        logger.info(
            f"✅ User created successfully: {new_user.email} (ID: {new_user.id})"
        )

        return SignupResponse(
            user_id=str(new_user.id),
            email=new_user.email,
            message="Account created successfully"
        )

    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise

    except IntegrityError as e:
        # Handle database constraint violations (e.g., unique email)
        await session.rollback()
        logger.error(f"Database integrity error during signup: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    except SQLAlchemyError as e:
        # Handle database errors
        await session.rollback()
        logger.error(f"Database error during signup: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable"
        )

    except Exception as e:
        # Catch-all for unexpected errors
        await session.rollback()
        logger.error(f"Unexpected error during signup: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration"
        )


# ============================================================================
# LOGIN ENDPOINT - PRODUCTION READY
# ============================================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "user_id": "1",
                        "email": "user@example.com",
                        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                }
            }
        },
        401: {
            "description": "Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Invalid credentials"}
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "An error occurred during login"}
                }
            }
        }
    }
)
async def login(
    request: LoginRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    Authenticate user and issue JWT token.

    ✅ PRODUCTION-READY ASYNC SQLALCHEMY 2.X PATTERN:
    - Uses await session.execute() (not exec)
    - Uses result.scalars().first() for proper extraction
    - Comprehensive error handling
    - Secure JWT token generation
    - Generic error messages to prevent user enumeration
    """
    try:
        # ✅ CORRECT: Pure SQLAlchemy 2.x async pattern
        # Step 1: Execute query and await the coroutine
        result = await session.execute(
            select(User).where(User.email == request.email)
        )

        # Step 2: Extract scalar result (single User object or None)
        user = result.scalars().first()

        # Return generic error to prevent user enumeration
        if not user:
            logger.warning(
                f"Login attempt with non-existent email: {request.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Verify password with bcrypt
        password_bytes = request.password.encode('utf-8')
        password_hash_bytes = user.password_hash.encode('utf-8')

        if not bcrypt.checkpw(password_bytes, password_hash_bytes):
            logger.warning(
                f"Failed login attempt for user: {request.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        # Generate JWT token
        now = datetime.utcnow()
        exp = now + timedelta(days=7)  # 7 days expiration

        payload = {
            "sub": str(user.id),  # Subject: User ID
            "email": user.email,
            "iat": int(now.timestamp()),  # Issued at
            "exp": int(exp.timestamp())   # Expiration
        }

        try:
            token = jwt.encode(
                payload,
                settings.BETTER_AUTH_SECRET,
                algorithm="HS256"
            )
        except JWTError as e:
            logger.error(f"JWT encoding error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate authentication token"
            )

        logger.info(
            f"✅ User logged in successfully: {user.email} (ID: {user.id})"
        )

        return LoginResponse(
            user_id=str(user.id),
            email=user.email,
            token=token
        )

    except HTTPException:
        # Re-raise HTTP exceptions without modification
        raise

    except SQLAlchemyError as e:
        # Handle database errors
        logger.error(f"Database error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service temporarily unavailable"
        )

    except Exception as e:
        # Catch-all for unexpected errors
        logger.error(f"Unexpected error during login: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )
