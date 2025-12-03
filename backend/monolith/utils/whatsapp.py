"""
WhatsApp Business API Client using Meta Cloud API
Sends transactional messages via WhatsApp
"""
import requests
import logging
from typing import Optional, Dict
from config import settings

logger = logging.getLogger(__name__)


class WhatsAppClient:
    """WhatsApp Business API client for sending messages"""
    
    def __init__(self):
        self.access_token = settings.META_ACCESS_TOKEN
        self.phone_number_id = settings.META_PHONE_NUMBER_ID
        self.api_version = settings.META_API_VERSION
        self.base_url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"
    
    def send_message(
        self,
        to_phone: str,
        message: str,
        message_type: str = "text"
    ) -> Dict:
        """
        Send a WhatsApp message
        
        Args:
            to_phone: Recipient phone number (format: 234XXXXXXXXXX for Nigeria)
            message: Message text content
            message_type: Type of message (text, template, etc.)
            
        Returns:
            Dict containing success status and message details
        """
        if not self.access_token or not self.phone_number_id:
            logger.error("WhatsApp credentials not configured")
            return {"success": False, "error": "WhatsApp not configured"}
        
        # Clean phone number (remove + and spaces)
        clean_phone = to_phone.replace("+", "").replace(" ", "").replace("-", "")
        
        # Ensure it starts with country code (234 for Nigeria)
        if not clean_phone.startswith("234") and clean_phone.startswith("0"):
            clean_phone = "234" + clean_phone[1:]
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "text",
            "text": {
                "body": message
            }
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"WhatsApp message sent to {clean_phone}")
                return {
                    "success": True,
                    "message_id": response.json().get("messages", [{}])[0].get("id"),
                    "phone": clean_phone
                }
            else:
                error_data = response.json()
                logger.error(f"WhatsApp API error: {error_data}")
                return {
                    "success": False,
                    "error": error_data.get("error", {}).get("message", "Unknown error"),
                    "status_code": response.status_code
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp request failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def send_template_message(
        self,
        to_phone: str,
        template_name: str,
        language_code: str = "en",
        components: Optional[list] = None
    ) -> Dict:
        """
        Send a pre-approved WhatsApp template message
        Templates must be approved by Meta before use
        
        Args:
            to_phone: Recipient phone number
            template_name: Name of approved template
            language_code: Template language (en, en_US, etc.)
            components: Template variable values
            
        Returns:
            Dict containing success status and message details
        """
        if not self.access_token or not self.phone_number_id:
            return {"success": False, "error": "WhatsApp not configured"}
        
        clean_phone = to_phone.replace("+", "").replace(" ", "").replace("-", "")
        if not clean_phone.startswith("234") and clean_phone.startswith("0"):
            clean_phone = "234" + clean_phone[1:]
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        
        if components:
            payload["template"]["components"] = components
        
        try:
            response = requests.post(
                self.base_url,
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"WhatsApp template sent to {clean_phone}")
                return {
                    "success": True,
                    "message_id": response.json().get("messages", [{}])[0].get("id")
                }
            else:
                error_data = response.json()
                logger.error(f"WhatsApp template error: {error_data}")
                return {
                    "success": False,
                    "error": error_data.get("error", {}).get("message")
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp template request failed: {str(e)}")
            return {"success": False, "error": str(e)}


# Global WhatsApp client instance
whatsapp_client = WhatsAppClient()
