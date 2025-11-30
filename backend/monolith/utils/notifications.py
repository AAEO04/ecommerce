# file: utils/notifications.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
from typing import Optional, Dict
from utils.mailgun import mailgun_client
import logging
import os
from jinja2 import Environment, FileSystemLoader, select_autoescape

logger = logging.getLogger(__name__)

# Get the directory of the current file
current_dir = os.path.dirname(os.path.abspath(__file__))
# Construct the path to the templates directory
template_dir = os.path.join(current_dir)

env = Environment(
    loader=FileSystemLoader(template_dir),
    autoescape=select_autoescape(['html', 'xml'])
)

def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    tags: Optional[list] = None,
    use_mailgun: bool = True
) -> bool:
    """
    Send email notification
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML body content
        text_content: Plain text fallback
        tags: Email tags for tracking (Mailgun only)
        use_mailgun: Use Mailgun API (True) or SMTP fallback (False)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if settings.NOTIFICATION_MOCK:
        print(f"📧 Email notification (mock): {to_email} - {subject}")
        return True
    
    # Try Mailgun first
    if use_mailgun and settings.MAILGUN_API_KEY:
        result = mailgun_client.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            tags=tags
        )
        
        if result.get("success"):
            return True
        else:
            logger.warning(f"Mailgun failed, falling back to SMTP: {result.get('error')}")
    
    # Fallback to SMTP
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.error("Neither Mailgun nor SMTP credentials are configured")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = settings.SENDER_EMAIL
        msg['To'] = to_email

        if text_content:
            text_part = MIMEText(text_content, 'plain')
            msg.attach(text_part)

        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email sent via SMTP to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS notification via Twilio"""
    if settings.NOTIFICATION_MOCK:
        print(f"SMS notification (mock): {to_phone} - {message}")
        return True
    
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print("Twilio credentials are not set. SMS not sent.")
        return False
    
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        msg = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        
        print(f"SMS sent successfully to {to_phone}: {msg.sid}")
        return True
    except Exception as e:
        print(f"Failed to send SMS to {to_phone}: {e}")
        return False

def generate_order_confirmation_email(order: 'models.Order') -> tuple:
    """Generate order confirmation email content using Jinja2 template"""
    subject = f"Order Confirmation - {order.order_number}"

    template = env.get_template("order_confirmation.html")
    html_content = template.render(
        order=order,
        items=[
            {
                "name": item.variant.product.name if item.variant and item.variant.product else 'Product',
                "size": item.variant.size if item.variant else '',
                "color": item.variant.color if item.variant else '',
                "quantity": item.quantity,
                "price": float(item.unit_price),
                "total": float(item.total_price)
            }
            for item in order.items
        ],
        total=float(order.total_amount)
    )

    text_content = f"""
    Order Confirmation - {order.order_number}

    Dear {order.customer_name},

    Thank you for your purchase! Your order has been confirmed.

    Order Details:
    - Order Number: {order.order_number}
    - Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
    - Payment Status: {order.payment_status.title()}

    Order Items:
    {'\n'.join([f'- {item.variant.product.name if item.variant and item.variant.product else 'Product'} - {item.variant.size if item.variant else ''} {item.variant.color if item.variant else ''} x{item.quantity} = ₦{item.total_price}' for item in order.items])}

    Total Amount: ₦{order.total_amount}

    Shipping Address:
    {order.shipping_address}

    Best regards,
    MAD RUSH Team
    """

    return subject, html_content, text_content

def send_order_confirmation(order):
    """Send order confirmation email and SMS"""
    # Send email
    subject, html_content, text_content = generate_order_confirmation_email(order)
    
    # Add tags for better tracking
    tags = ["order-confirmation", f"order-{order.order_number}"]
    
    send_email(
        to_email=order.customer_email,
        subject=subject,
        html_content=html_content,
        text_content=text_content,
        tags=tags
    )
    
    # Send SMS if phone number is available
    if order.customer_phone:
        sms_message = f"Order Confirmed! Order #{order.order_number}. Total: ₦{order.total_amount}. Thank you for shopping with MAD RUSH!"
        send_sms(order.customer_phone, sms_message)

