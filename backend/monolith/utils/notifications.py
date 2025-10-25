# file: utils/notifications.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import models

def send_email(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """Send email notification"""
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"Email notification (mock): {to_email} - {subject}")
        return True
    
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
        
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS notification via Twilio"""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        print(f"SMS notification (mock): {to_phone} - {message}")
        return True
    
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

def generate_order_confirmation_email(order) -> tuple:
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
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₦{item.unit_price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₦{item.total_price}</td>
        </tr>
        """
        items_text += f"- {product.name if product else 'Product'} - {variant.size} {variant.color or ''} x{item.quantity} = ₦{item.total_price}\n"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 5px; color: white; }}
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
                <h1>MAD RUSH</h1>
                <p>Order Confirmation</p>
            </div>
            
            <div class="content">
                <p>Dear {order.customer_name},</p>
                
                <p>Thank you for your purchase! Your order has been confirmed and is being processed.</p>
                
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
                    <p>Total Amount: ₦{order.total_amount}</p>
                </div>
                
                <h3>Shipping Address:</h3>
                <p>{order.shipping_address}</p>
                
                <p>We'll contact you to arrange delivery within 24 hours.</p>
                
                <p>Best regards,<br>MAD RUSH Team</p>
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
    
    Thank you for your purchase! Your order has been confirmed.
    
    Order Details:
    - Order Number: {order.order_number}
    - Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
    - Payment Status: {order.payment_status.title()}
    
    Order Items:
    {items_text}
    
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
    send_email(order.customer_email, subject, html_content, text_content)
    
    # Send SMS if phone number is available
    if order.customer_phone:
        sms_message = f"Order Confirmed! Order #{order.order_number}. Total: ₦{order.total_amount}. Thank you for shopping with MAD RUSH!"
        send_sms(order.customer_phone, sms_message)

