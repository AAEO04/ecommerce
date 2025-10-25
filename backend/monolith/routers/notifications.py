# file: routers/notifications.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from utils.notifications import send_email, send_sms

router = APIRouter()

@router.post("/test-email")
def send_test_email(
    email: str,
    subject: str = "Test Email",
    message: str = "This is a test email from MAD RUSH."
):
    """Send a test email"""
    
    html_content = f"""
    <html>
    <body>
        <h2>Test Email</h2>
        <p>{message}</p>
        <p>If you received this email, the notification service is working correctly!</p>
    </body>
    </html>
    """
    
    success = send_email(email, subject, html_content, message)
    
    if success:
        return {"message": f"Test email sent to {email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test email")

@router.post("/test-sms")
def send_test_sms(
    phone: str,
    message: str = "This is a test SMS from MAD RUSH."
):
    """Send a test SMS"""
    
    success = send_sms(phone, message)
    
    if success:
        return {"message": f"Test SMS sent to {phone}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test SMS")

