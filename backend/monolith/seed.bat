@echo off
REM Database Seeding Helper Script for Windows

echo.
echo 🌱 MAD RUSH Database Seeder
echo ======================================
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found. Please install Python 3.7+
    exit /b 1
)

REM Check for arguments
if "%1"=="" (
    echo Seeding all data...
    python seed_database.py
    goto :end
)

if /i "%1"=="admin" (
    echo Seeding test admin only...
    python seed_database.py admin
    goto :end
)

if /i "%1"=="categories" (
    echo Seeding categories only...
    python seed_database.py categories
    goto :end
)

if /i "%1"=="products" (
    echo Seeding products only...
    python seed_database.py products
    goto :end
)

if /i "%1"=="create-admin" (
    echo Creating new admin user...
    python create_admin.py
    goto :end
)

echo ❌ Unknown option: %1
echo.
echo Usage:
echo   seed.bat              # Seed everything
echo   seed.bat admin        # Seed test admin only
echo   seed.bat categories   # Seed categories only
echo   seed.bat products     # Seed products only
echo   seed.bat create-admin # Create production admin
exit /b 1

:end
echo.
echo ✅ Done!
