@echo off
REM Cleanup Expired Pending Checkouts Job
REM Run this script to clean up expired pending checkouts

cd /d "%~dp0backend\monolith"

echo [%date% %time%] Running cleanup job...

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Run the cleanup script
python jobs\cleanup_expired_checkouts.py

if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] Cleanup completed successfully
) else (
    echo [%date% %time%] Cleanup failed with error code %ERRORLEVEL%
)

REM Deactivate virtual environment
if exist "venv\Scripts\deactivate.bat" (
    call venv\Scripts\deactivate.bat
)
