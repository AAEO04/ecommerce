# MAD RUSH - PowerShell Startup Script
Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  MAD RUSH - Complete System Startup"  -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check PostgreSQL
Write-Host "[1/8] Checking PostgreSQL..." -ForegroundColor Yellow
$pgStatus = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if (-not $pgStatus.TcpTestSucceeded) {
    Write-Host "[ERROR] PostgreSQL is not running!" -ForegroundColor Red
    Write-Host "Please start PostgreSQL service first." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[OK] PostgreSQL is running" -ForegroundColor Green

# Check Redis
Write-Host ""
Write-Host "[2/8] Checking Redis..." -ForegroundColor Yellow
$redisStatus = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
if (-not $redisStatus.TcpTestSucceeded) {
    Write-Host "[WARNING] Redis is not running. Caching will be disabled." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Redis is running" -ForegroundColor Green
}

# Activate virtual environment and migrate database
Write-Host ""
Write-Host "[3/8] Activating virtual environment..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend\monolith"

if (Test-Path ".\venv\Scripts\Activate.ps1") {
    Write-Host "[OK] Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to create virtual environment!" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "[OK] Virtual environment created" -ForegroundColor Green
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    & ".\venv\Scripts\python.exe" -m pip install --upgrade pip
    & ".\venv\Scripts\pip.exe" install -r requirements.txt
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
}

# Migrate database using Alembic
Write-Host ""
Write-Host "[4/8] Migrating database..." -ForegroundColor Yellow
& ".\venv\Scripts\alembic.exe" upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Database migration failed!" -ForegroundColor Red
    Write-Host "[INFO] Trying to create tables directly..." -ForegroundColor Yellow
    & ".\venv\Scripts\python.exe" -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine); print('[OK] Database tables created!')"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Database setup failed!" -ForegroundColor Red
        pause
        exit 1
    }
}
Write-Host "[OK] Database migrated successfully" -ForegroundColor Green

# Seed database
Write-Host ""
Write-Host "[5/8] Seeding database..." -ForegroundColor Yellow
& ".\venv\Scripts\python.exe" seed.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Database seeding had issues (may already be seeded)" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Database seeded successfully" -ForegroundColor Green
}

# Start backend with virtual environment
Write-Host ""
Write-Host "[6/8] Starting backend server..." -ForegroundColor Yellow
$backendCmd = "cd '$PSScriptRoot\backend\monolith'; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --host 0.0.0.0 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Host "[OK] Backend server starting..." -ForegroundColor Green
Start-Sleep -Seconds 8

# Start admin panel
Write-Host ""
Write-Host "[7/8] Starting admin panel..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend\admin_panel"
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing admin panel dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend\admin_panel'; npm run dev"
Write-Host "[OK] Admin panel starting..." -ForegroundColor Green
Start-Sleep -Seconds 5

# Start customer store
Write-Host ""
Write-Host "[8/8] Starting customer store..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend\customer_store"
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing customer store dependencies..." -ForegroundColor Yellow
    npm install
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend\customer_store'; npm run dev"
Write-Host "[OK] Customer store starting..." -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[COMPLETE] All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Services Running:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:         http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Admin Panel:      http://localhost:3001" -ForegroundColor Green
Write-Host "  Customer Store:   http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@Madrush.com.ng" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open all services in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open in browser
Start-Process "http://localhost:8000/docs"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3001"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "All services opened in browser!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop all services, close the PowerShell windows." -ForegroundColor Yellow
Write-Host ""
pause
