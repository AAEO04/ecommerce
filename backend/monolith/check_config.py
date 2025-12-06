#!/usr/bin/env python
"""Check current cookie and CORS configuration"""
import os

print("Current Cookie & CORS Configuration")
print("=" * 60)

# Cookie settings
cookie_secure = os.getenv("COOKIE_SECURE", "false")
cookie_samesite = os.getenv("COOKIE_SAMESITE", "lax")
cookie_domain = os.getenv("COOKIE_DOMAIN", "")
cookie_max_age = os.getenv("COOKIE_MAX_AGE", "1800")

# CORS settings
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
environment = os.getenv("ENVIRONMENT", "development")

print(f"\n🍪 Cookie Settings:")
print(f"  COOKIE_SECURE: {cookie_secure}")
print(f"  COOKIE_SAMESITE: {cookie_samesite}")
print(f"  COOKIE_DOMAIN: {cookie_domain if cookie_domain else '(not set)'}")
print(f"  COOKIE_MAX_AGE: {cookie_max_age}s")

print(f"\n🌐 CORS Settings:")
print(f"  CORS_ORIGINS: {cors_origins}")
print(f"  FRONTEND_URL: {frontend_url}")

print(f"\n⚙️  Environment:")
print(f"  ENVIRONMENT: {environment}")

print(f"\n" + "=" * 60)
print("Recommendations:")
print("=" * 60)

issues = []

if cookie_secure.lower() != "true" and environment == "production":
    issues.append("⚠️  COOKIE_SECURE should be 'true' in production (HTTPS)")

if cookie_samesite.lower() == "lax":
    issues.append("⚠️  COOKIE_SAMESITE='lax' may block cookies in some scenarios")
    issues.append("   Consider setting to 'none' (requires COOKIE_SECURE=true)")

if not cookie_domain and environment == "production":
    issues.append("⚠️  COOKIE_DOMAIN not set - cookies won't work across subdomains")
    issues.append("   Set to '.madrush.com.ng' if using subdomains")

if "localhost" in cors_origins and environment == "production":
    issues.append("⚠️  CORS_ORIGINS includes localhost in production")

if issues:
    for issue in issues:
        print(issue)
else:
    print("✅ Configuration looks good!")

print("\n" + "=" * 60)
print("Recommended Production Settings:")
print("=" * 60)
print("fly secrets set COOKIE_SECURE=true")
print("fly secrets set COOKIE_SAMESITE=none")
print("fly secrets set COOKIE_DOMAIN=.madrush.com.ng")
print("fly secrets set CORS_ORIGINS=https://www.madrush.com.ng,https://madrush.com.ng")
