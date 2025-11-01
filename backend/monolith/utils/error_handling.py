# file: utils/error_handling.py
import logging
import uuid
from typing import Any, Dict, Optional
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecureErrorHandler:
    """Secure error handling utility"""
    
    @staticmethod
    def create_error_response(
        status_code: int,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        log_error: bool = True,
        error_id: Optional[str] = None
    ) -> JSONResponse:
        """Create a secure error response"""
        
        # Generate error ID for tracking
        if not error_id:
            error_id = str(uuid.uuid4())[:8]
        
        # Log error details (server-side only)
        if log_error:
            logger.error(f"Error {error_id}: {message}")
            if details:
                logger.error(f"Error {error_id} details: {details}")
        
        # Create safe response (no sensitive details exposed)
        response_data = {
            "error": "An error occurred",
            "message": message,
            "error_id": error_id
        }
        
        # Add non-sensitive details if provided
        if details and not any(key in str(details).lower() for key in ['password', 'secret', 'key', 'token']):
            response_data["details"] = details
        
        return JSONResponse(
            status_code=status_code,
            content=response_data
        )
    
    @staticmethod
    def handle_database_error(error: Exception, operation: str = "database operation") -> JSONResponse:
        """Handle database errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        # Log full error for debugging
        logger.error(f"Database error {error_id} during {operation}: {str(error)}")
        logger.error(f"Database error {error_id} traceback: {traceback.format_exc()}")
        
        # Return generic error to client
        return SecureErrorHandler.create_error_response(
            status_code=500,
            message="Database operation failed. Please try again later.",
            error_id=error_id,
            log_error=False  # Already logged above
        )
    
    @staticmethod
    def handle_validation_error(error: Exception, field: str = None) -> JSONResponse:
        """Handle validation errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"Validation error {error_id}: {str(error)}")
        
        message = f"Invalid input data"
        if field:
            message = f"Invalid {field}"
        
        return SecureErrorHandler.create_error_response(
            status_code=400,
            message=message,
            error_id=error_id,
            log_error=False
        )
    
    @staticmethod
    def handle_authentication_error(error: Exception) -> JSONResponse:
        """Handle authentication errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"Authentication error {error_id}: {str(error)}")
        
        return SecureErrorHandler.create_error_response(
            status_code=401,
            message="Authentication failed",
            error_id=error_id,
            log_error=False
        )
    
    @staticmethod
    def handle_authorization_error(error: Exception) -> JSONResponse:
        """Handle authorization errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        logger.warning(f"Authorization error {error_id}: {str(error)}")
        
        return SecureErrorHandler.create_error_response(
            status_code=403,
            message="Access denied",
            error_id=error_id,
            log_error=False
        )
    
    @staticmethod
    def handle_payment_error(error: Exception, operation: str = "payment") -> JSONResponse:
        """Handle payment errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        logger.error(f"Payment error {error_id} during {operation}: {str(error)}")
        
        return SecureErrorHandler.create_error_response(
            status_code=400,
            message="Payment processing failed. Please try again.",
            error_id=error_id,
            log_error=False
        )
    
    @staticmethod
    def handle_generic_error(error: Exception, operation: str = "operation") -> JSONResponse:
        """Handle generic errors securely"""
        error_id = str(uuid.uuid4())[:8]
        
        logger.error(f"Generic error {error_id} during {operation}: {str(error)}")
        logger.error(f"Generic error {error_id} traceback: {traceback.format_exc()}")
        
        return SecureErrorHandler.create_error_response(
            status_code=500,
            message="An unexpected error occurred. Please try again later.",
            error_id=error_id,
            log_error=False
        )

def secure_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for FastAPI"""
    if isinstance(exc, HTTPException):
        return SecureErrorHandler.create_error_response(
            status_code=exc.status_code,
            message=exc.detail,
            log_error=False
        )
    
    return SecureErrorHandler.handle_generic_error(exc, f"request to {request.url.path}")
