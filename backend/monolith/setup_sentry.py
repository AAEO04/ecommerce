"""
Sentry Integration Setup for MAD RUSH
Error tracking and performance monitoring
"""
import os

def setup_sentry_integration():
    """
    Instructions for setting up Sentry integration
    """
    
    print("""
╔══════════════════════════════════════════════════════════════════════════╗
║                     SENTRY INTEGRATION SETUP                              ║
╚══════════════════════════════════════════════════════════════════════════╝

Sentry provides error tracking and performance monitoring for production.

📋 SETUP STEPS:

1️⃣  Install Sentry SDK
   ─────────────────────────────────────────────────────────────────────────
   pip install sentry-sdk[fastapi]


2️⃣  Get Your Sentry DSN
   ─────────────────────────────────────────────────────────────────────────
   • Go to https://sentry.io
   • Create a free account (or login)
   • Create a new project (select "FastAPI" or "Python")
   • Copy your DSN (looks like: https://xxx@sentry.io/xxx)


3️⃣  Add to Environment Variables
   ─────────────────────────────────────────────────────────────────────────
   Add to your .env file:
   
   SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   

4️⃣  Add to main.py
   ─────────────────────────────────────────────────────────────────────────
   Add this code at the TOP of main.py (after imports):
   
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
   
   # Initialize Sentry
   if os.getenv("SENTRY_DSN"):
       sentry_sdk.init(
           dsn=os.getenv("SENTRY_DSN"),
           integrations=[
               FastApiIntegration(),
               SqlalchemyIntegration(),
           ],
           environment=settings.ENVIRONMENT,
           
           # Performance monitoring
           traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
           
           # Error sampling
           sample_rate=1.0,
           
           # Release tracking (optional)
           release=f"madrush@{os.getenv('APP_VERSION', '1.0.0')}",
           
           # Additional options
           send_default_pii=False,  # Don't send personal data
           attach_stacktrace=True,
           max_breadcrumbs=50,
       )
       print(f"[OK] Sentry initialized for {settings.ENVIRONMENT}")
   else:
       print("[WARN] Sentry DSN not configured")
   ```


5️⃣  Test Sentry Integration
   ─────────────────────────────────────────────────────────────────────────
   Add a test endpoint to verify Sentry is working:
   
   ```python
   @app.get("/sentry-test")
   def sentry_test():
       '''Test endpoint to verify Sentry integration'''
       division_by_zero = 1 / 0  # This will trigger an error
   ```
   
   Then visit: http://localhost:8000/sentry-test
   Check your Sentry dashboard for the error.


6️⃣  Custom Error Tracking (Optional)
   ─────────────────────────────────────────────────────────────────────────
   Track custom events:
   
   ```python
   from sentry_sdk import capture_exception, capture_message
   
   try:
       # Your code
       process_payment()
   except Exception as e:
       capture_exception(e)
       # or
       capture_message(f"Payment failed for order {order_id}", level="error")
   ```


7️⃣  User Context (Optional)
   ─────────────────────────────────────────────────────────────────────────
   Add user context to errors:
   
   ```python
   from sentry_sdk import set_user
   
   @app.middleware("http")
   async def add_sentry_context(request: Request, call_next):
       # Get user from JWT token
       user = get_current_user(request)
       if user:
           set_user({"id": user.id, "email": user.email})
       
       response = await call_next(request)
       return response
   ```


8️⃣  Performance Monitoring
   ─────────────────────────────────────────────────────────────────────────
   Sentry automatically tracks:
   • API endpoint performance
   • Database query performance
   • External API calls
   • Error rates
   
   View in Sentry dashboard: Performance → Transactions


9️⃣  Alerts & Notifications
   ─────────────────────────────────────────────────────────────────────────
   Set up alerts in Sentry dashboard:
   • Email notifications for errors
   • Slack integration
   • Error frequency thresholds
   • Performance degradation alerts


🔟  Production Best Practices
   ─────────────────────────────────────────────────────────────────────────
   ✅ Set traces_sample_rate to 0.1 (10%) in production
   ✅ Use environment tags (development, staging, production)
   ✅ Set up release tracking for deployments
   ✅ Configure error grouping rules
   ✅ Set up issue ownership (assign to teams)
   ✅ Use breadcrumbs for debugging context


📊 WHAT SENTRY TRACKS:

✅ Unhandled Exceptions
✅ HTTP Errors (4xx, 5xx)
✅ Database Errors
✅ Performance Issues
✅ API Response Times
✅ Error Frequency & Trends
✅ User Impact Analysis
✅ Stack Traces & Context


💰 PRICING:

• Free Tier: 5,000 errors/month (good for small projects)
• Team Plan: $26/month (50,000 errors/month)
• Business Plan: Custom pricing


🔗 USEFUL LINKS:

• Sentry Dashboard: https://sentry.io
• FastAPI Integration: https://docs.sentry.io/platforms/python/guides/fastapi/
• Python SDK Docs: https://docs.sentry.io/platforms/python/


✅ VERIFICATION CHECKLIST:

□ Sentry SDK installed
□ SENTRY_DSN added to .env
□ Sentry initialized in main.py
□ Test endpoint works
□ Errors appear in Sentry dashboard
□ Performance monitoring enabled
□ Alerts configured


═══════════════════════════════════════════════════════════════════════════

Need help? Check the Sentry documentation or contact support.

═══════════════════════════════════════════════════════════════════════════
""")


if __name__ == "__main__":
    setup_sentry_integration()
