# file: notification_service/main.py
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import requests

# Import shared models and schemas
from shared_models import models, schemas
from shared_models.database import SessionLocal, engine, get_db

# Notification configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "noreply@yourbrand.com")

# Twilio configuration for WhatsApp/SMS
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Notification Service API",
    description="E-commerce notification service for emails and SMS",
    version="1.0.0"
)

def send_email(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """Send email notification"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"Email notification (mock): {to_email} - {subject}")
        return True
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email

        if text_content:
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)

        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS notification via Twilio"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        print(f"SMS notification (mock): {to_phone} - {message}")
        return True
    
    try:
        from twilio.rest import Client
        
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        
        print(f"SMS sent successfully to {to_phone}: {message.sid}")
        return True
    except Exception as e:
        print(f"Failed to send SMS to {to_phone}: {e}")
        return False

def generate_order_confirmation_email(order: models.Order) -> tuple[str, str]:
    """Generate order confirmation email content"""
    subject = f"Order Confirmation - {order.order_number}"
    
    # Calculate item details
    items_html = ""
    items_text = ""
    for item in order.items:
        variant = item.variant
        product = variant.product if variant else None
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                {product.name if product else 'Product'} - {variant.size} {variant.color or ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.unit_price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.total_price}</td>
        </tr>
        """
        items_text += f"- {product.name if product else 'Product'} - {variant.size} {variant.color or ''} x{item.quantity} = ${item.total_price}\n"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }}
            .content {{ padding: 20px; }}
            .order-details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            th, td {{ padding: 10px; text-align: left; }}
            th {{ background-color: #f8f9fa; }}
            .total {{ font-weight: bold; font-size: 1.2em; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p>Thank you for your purchase!</p>
            </div>
            
            <div class="content">
                <p>Dear {order.customer_name},</p>
                
                <p>Your order has been confirmed and is being processed. Here are your order details:</p>
                
                <div class="order-details">
                    <p><strong>Order Number:</strong> {order.order_number}</p>
                    <p><strong>Order Date:</strong> {order.created_at.strftime('%B %d, %Y at %I:%M %p')}</p>
                    <p><strong>Payment Status:</strong> {order.payment_status.title()}</p>
                </div>
                
                <h3>Order Items:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
                
                <div class="total">
                    <p>Total Amount: ${order.total_amount}</p>
                </div>
                
                <h3>Shipping Address:</h3>
                <p>{order.shipping_address}</p>
                
                <p>We'll send you another email when your order ships.</p>
                
                <p>If you have any questions, please contact our customer service team.</p>
                
                <p>Best regards,<br>Your Brand Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Order Confirmation - {order.order_number}
    
    Dear {order.customer_name},
    
    Thank you for your purchase! Your order has been confirmed and is being processed.
    
    Order Details:
    - Order Number: {order.order_number}
    - Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
    - Payment Status: {order.payment_status.title()}
    
    Order Items:
    {items_text}
    
    Total Amount: ${order.total_amount}
    
    Shipping Address:
    {order.shipping_address}
    
    We'll send you another email when your order ships.
    
    If you have any questions, please contact our customer service team.
    
    Best regards,
    Your Brand Team
    """
    
    return subject, html_content, text_content

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Notification Service API!",
        "version": "1.0.0",
        "email_status": "configured" if SMTP_USERNAME else "mock_mode",
        "sms_status": "configured" if TWILIO_ACCOUNT_SID else "mock_mode"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    status = {"status": "healthy"}
    
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {str(e)}"
        status["status"] = "unhealthy"
    
    return status

@app.post("/notifications/order/{order_id}")
def send_order_notification(order_id: int, background_tasks: BackgroundTasks):
    """Send order confirmation notifications"""
    
    # Get order details
    db = SessionLocal()
    try:
        order = db.query(models.Order).options(
            joinedload(models.Order.items).joinedload(models.OrderItem.variant)
        ).filter(models.Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Send email notification
        background_tasks.add_task(send_order_confirmation_email, order)
        
        # Send SMS notification if phone number is available
        if order.customer_phone:
            background_tasks.add_task(send_order_confirmation_sms, order)
        
        return {"message": "Order notifications queued successfully"}
    
    finally:
        db.close()

def send_order_confirmation_email(order: models.Order):
    """Send order confirmation email"""
    subject, html_content, text_content = generate_order_confirmation_email(order)
    
    success = send_email(
        to_email=order.customer_email,
        subject=subject,
        html_content=html_content,
        text_content=text_content
    )
    
    if success:
        print(f"Order confirmation email sent to {order.customer_email}")
    else:
        print(f"Failed to send order confirmation email to {order.customer_email}")

def send_order_confirmation_sms(order: models.Order):
    """Send order confirmation SMS"""
    message = f"""
    Order Confirmed! 
    Order #{order.order_number}
    Total: ${order.total_amount}
    Thank you for shopping with us!
    """
    
    success = send_sms(order.customer_phone, message.strip())
    
    if success:
        print(f"Order confirmation SMS sent to {order.customer_phone}")
    else:
        print(f"Failed to send order confirmation SMS to {order.customer_phone}")

@app.post("/notifications/test-email")
def send_test_email(
    email: str,
    subject: str = "Test Email",
    message: str = "This is a test email from the notification service."
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

@app.post("/notifications/test-sms")
def send_test_sms(
    phone: str,
    message: str = "This is a test SMS from the notification service."
):
    """Send a test SMS"""
    
    success = send_sms(phone, message)
    
    if success:
        return {"message": f"Test SMS sent to {phone}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test SMS")

@app.get("/notifications/status")
def get_notification_status():
    """Get notification service status"""
    return {
        "email_configured": bool(SMTP_USERNAME and SMTP_PASSWORD),
        "sms_configured": bool(TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN),
        "sender_email": SENDER_EMAIL,
        "smtp_host": SMTP_HOST,
        "smtp_port": SMTP_PORT
    }
