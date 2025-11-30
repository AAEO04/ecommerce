# file: utils/mailgun.py
import requests
from typing import Optional, Dict, List
from config import settings
import logging

logger = logging.getLogger(__name__)

class MailgunClient:
    """Mailgun email client for sending transactional emails"""
    
    def __init__(self):
        self.api_key = settings.MAILGUN_API_KEY
        self.domain = settings.MAILGUN_DOMAIN
        self.region = settings.MAILGUN_REGION
        
        # Set base URL based on region
        if self.region == "eu":
            self.base_url = f"https://api.eu.mailgun.net/v3/{self.domain}"
        else:
            self.base_url = f"https://api.mailgun.net/v3/{self.domain}"
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        from_name: Optional[str] = None,
        tags: Optional[List[str]] = None,
        track_opens: bool = True,
        track_clicks: bool = True
    ) -> Dict:
        """
        Send email via Mailgun API
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text fallback
            from_name: Sender name (defaults to settings.SENDER_NAME)
            tags: List of tags for tracking
            track_opens: Enable open tracking
            track_clicks: Enable click tracking
            
        Returns:
            Response dict with 'success' and 'message_id' or 'error'
        """
        if not self.api_key or not self.domain:
            logger.error("Mailgun credentials not configured")
            return {"success": False, "error": "Mailgun not configured"}
        
        from_name = from_name or settings.SENDER_NAME
        from_address = f"{from_name} <{settings.SENDER_EMAIL}>"
        
        data = {
            "from": from_address,
            "to": to_email,
            "subject": subject,
            "html": html_content,
            "o:tracking": "yes" if track_opens else "no",
            "o:tracking-clicks": "yes" if track_clicks else "no",
        }
        
        if text_content:
            data["text"] = text_content
        
        if tags:
            data["o:tag"] = tags
        
        try:
            response = requests.post(
                f"{self.base_url}/messages",
                auth=("api", self.api_key),
                data=data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Email sent successfully to {to_email}: {result.get('id')}")
                return {
                    "success": True,
                    "message_id": result.get("id"),
                    "message": result.get("message")
                }
            else:
                logger.error(f"Mailgun API error: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "error": f"API error: {response.status_code}",
                    "details": response.text
                }
                
        except Exception as e:
            logger.error(f"Failed to send email via Mailgun: {e}")
            return {"success": False, "error": str(e)}
    
    def validate_email(self, email: str) -> Dict:
        """
        Validate email address using Mailgun's validation API
        
        Args:
            email: Email address to validate
            
        Returns:
            Dict with validation results
        """
        try:
            response = requests.get(
                f"https://api.mailgun.net/v4/address/validate",
                auth=("api", self.api_key),
                params={"address": email},
                timeout=5
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"is_valid": False, "error": "Validation failed"}
                
        except Exception as e:
            logger.error(f"Email validation error: {e}")
            return {"is_valid": False, "error": str(e)}

# Global instance
mailgun_client = MailgunClient()
