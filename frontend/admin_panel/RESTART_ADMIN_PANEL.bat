@echo off
echo.
echo ================================================
echo   MAD RUSH Admin Panel - Clean Restart
echo ================================================
echo.

echo [1/3] Stopping any running processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/3] Cleaning build cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo       Cache cleaned!

echo [3/3] Starting admin panel...
echo.
npm run dev

pause
