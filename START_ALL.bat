@echo off
echo.
echo ========================================
echo   MAD RUSH - Complete System Startup
echo ========================================
echo.

REM Check if PostgreSQL is running
echo [1/6] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL is not running!
    echo Please start PostgreSQL service first.
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running

REM Migrate database
echo.
echo [2/6] Migrating database...
cd backend\monolith
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine); print('[OK] Database migrated successfully!')"
if %errorlevel% neq 0 (
    echo [ERROR] Database migration failed!
    pause
    exit /b 1
)

REM Start backend
echo.
echo [3/6] Starting backend server...
start "MAD RUSH Backend" cmd /k "cd /d %~dp0backend\monolith && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 5 >nul

REM Start admin panel
echo.
echo [4/6] Starting admin panel...
start "MAD RUSH Admin Panel" cmd /k "cd /d %~dp0frontend\admin_panel && npm run dev"
timeout /t 5 >nul

REM Start customer store
echo.
echo [5/6] Starting customer store...
start "MAD RUSH Customer Store" cmd /k "cd /d %~dp0frontend\customer_store && npm run dev"
timeout /t 3 >nul

echo.
echo [6/6] All services started!
echo.
echo ========================================
echo   Services Running:
echo ========================================
echo   Backend API:      http://localhost:8000
echo   API Docs:         http://localhost:8000/docs
echo   Admin Panel:      http://localhost:3001
echo   Customer Store:   http://localhost:3000
echo ========================================
echo.
echo Press any key to open all services in browser...
pause >nul

REM Open in browser
start http://localhost:8000/docs
timeout /t 1 >nul
start http://localhost:3001
timeout /t 1 >nul
start http://localhost:3000

echo.
echo All services opened in browser!
echo.
echo To stop all services, close the terminal windows.
echo.
pause
