# file: utils/validation.py
import re
import html
from typing import Any, Optional, List
from pydantic import BaseModel, validator
import bleach

class InputSanitizer:
    """Input sanitization utility"""
    
    # Allowed HTML tags for rich text content
    ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    
    # Allowed HTML attributes
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
    }
    
    @staticmethod
    def sanitize_string(input_string: str, max_length: int = 1000) -> str:
        """Sanitize a string input"""
        if not isinstance(input_string, str):
            return ""
        
        # Truncate if too long
        if len(input_string) > max_length:
            input_string = input_string[:max_length]
        
        # HTML escape
        sanitized = html.escape(input_string)
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_html(input_html: str, max_length: int = 10000) -> str:
        """Sanitize HTML input"""
        if not isinstance(input_html, str):
            return ""
        
        # Truncate if too long
        if len(input_html) > max_length:
            input_html = input_html[:max_length]
        
        # Use bleach to sanitize HTML
        sanitized = bleach.clean(
            input_html,
            tags=InputSanitizer.ALLOWED_TAGS,
            attributes=InputSanitizer.ALLOWED_ATTRIBUTES,
            strip=True
        )
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_email(email: str) -> Optional[str]:
        """Sanitize and validate email"""
        if not isinstance(email, str):
            return None
        
        # Basic email validation regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        # Clean and validate
        email = email.strip().lower()
        if re.match(email_pattern, email) and len(email) <= 254:
            return email
        
        return None
    
    @staticmethod
    def sanitize_phone(phone: str) -> Optional[str]:
        """Sanitize and validate phone number"""
        if not isinstance(phone, str):
            return None
        
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Check if it's a valid length (7-15 digits)
        if 7 <= len(digits_only) <= 15:
            return digits_only
        
        return None
    
    @staticmethod
    def sanitize_search_term(search_term: str) -> str:
        """Sanitize search input"""
        if not isinstance(search_term, str):
            return ""
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\';\\]', '', search_term)
        
        # Limit length
        if len(sanitized) > 100:
            sanitized = sanitized[:100]
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_url(url: str) -> Optional[str]:
        """Sanitize and validate URL"""
        if not isinstance(url, str):
            return None
        
        # Basic URL validation
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        
        url = url.strip()
        if re.match(url_pattern, url) and len(url) <= 2048:
            return url
        
        return None

class SecureValidators:
    """Pydantic validators for security"""
    
    @staticmethod
    def validate_string_length(value: str, min_length: int = 1, max_length: int = 1000) -> str:
        """Validate string length"""
        if not isinstance(value, str):
            raise ValueError("Must be a string")
        
        if len(value) < min_length:
            raise ValueError(f"Must be at least {min_length} characters long")
        
        if len(value) > max_length:
            raise ValueError(f"Must be no more than {max_length} characters long")
        
        return InputSanitizer.sanitize_string(value, max_length)
    
    @staticmethod
    def validate_email(value: str) -> str:
        """Validate and sanitize email"""
        sanitized = InputSanitizer.sanitize_email(value)
        if not sanitized:
            raise ValueError("Invalid email format")
        return sanitized
    
    @staticmethod
    def validate_phone(value: str) -> str:
        """Validate and sanitize phone number"""
        sanitized = InputSanitizer.sanitize_phone(value)
        if not sanitized:
            raise ValueError("Invalid phone number format")
        return sanitized
    
    @staticmethod
    def validate_search_term(value: str) -> str:
        """Validate and sanitize search term"""
        return InputSanitizer.sanitize_search_term(value)
    
    @staticmethod
    def validate_url(value: str) -> str:
        """Validate and sanitize URL"""
        sanitized = InputSanitizer.sanitize_url(value)
        if not sanitized:
            raise ValueError("Invalid URL format")
        return sanitized
    
    @staticmethod
    def validate_price(value: float) -> float:
        """Validate price"""
        if not isinstance(value, (int, float)):
            raise ValueError("Price must be a number")
        
        if value < 0:
            raise ValueError("Price cannot be negative")
        
        if value > 999999.99:
            raise ValueError("Price too high")
        
        return round(float(value), 2)
    
    @staticmethod
    def validate_quantity(value: int) -> int:
        """Validate quantity"""
        if not isinstance(value, int):
            raise ValueError("Quantity must be an integer")
        
        if value < 0:
            raise ValueError("Quantity cannot be negative")
        
        if value > 1000:
            raise ValueError("Quantity too high")
        
        return value

def sanitize_input(input_data: Any) -> Any:
    """Generic input sanitization"""
    if isinstance(input_data, str):
        return InputSanitizer.sanitize_string(input_data)
    elif isinstance(input_data, dict):
        return {key: sanitize_input(value) for key, value in input_data.items()}
    elif isinstance(input_data, list):
        return [sanitize_input(item) for item in input_data]
    else:
        return input_data
