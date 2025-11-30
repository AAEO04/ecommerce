# Backend Startup Script with Virtual Environment
# This script activates the virtual environment and starts the backend server

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host "  🚀 MADRUSH BACKEND STARTUP" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$BackendPath = "$PSScriptRoot\backend\monolith"
Set-Location $BackendPath

# Check if virtual environment exists
Write-Host "[1/6] Checking virtual environment..." -ForegroundColor Yellow
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
}

# Activate virtual environment
Write-Host ""
Write-Host "[2/6] Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"
Write-Host "[OK] Virtual environment activated" -ForegroundColor Green

# Install/update dependencies
Write-Host ""
Write-Host "[3/6] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    $response = Read-Host "Install/update dependencies? (y/n)"
    if ($response -eq 'y') {
        Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
        & ".\venv\Scripts\python.exe" -m pip install --upgrade pip
        & ".\venv\Scripts\pip.exe" install -r requirements.txt
        Write-Host "[OK] Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Skipping dependency installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] requirements.txt not found" -ForegroundColor Yellow
}

# Run health check
Write-Host ""
Write-Host "[4/6] Running health checks..." -ForegroundColor Yellow
& ".\venv\Scripts\python.exe" health_check.py
$healthCheckExitCode = $LASTEXITCODE

if ($healthCheckExitCode -ne 0) {
    Write-Host ""
    Write-Host "[WARNING] Health check failed!" -ForegroundColor Yellow
    Write-Host "[INFO] You may need to:" -ForegroundColor Yellow
    Write-Host "  1. Ensure PostgreSQL is running" -ForegroundColor White
    Write-Host "  2. Run: python reset_database.py" -ForegroundColor White
    Write-Host "  3. Run: python seed.py" -ForegroundColor White
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne 'y') {
        Write-Host "[ABORT] Startup cancelled" -ForegroundColor Red
        exit 1
    }
}

# Check if database needs setup
Write-Host ""
Write-Host "[5/6] Checking database..." -ForegroundColor Yellow
$needsSetup = $false

try {
    & ".\venv\Scripts\python.exe" -c "from database import engine; from sqlalchemy import inspect; inspector = inspect(engine); tables = inspector.get_table_names(); exit(0 if len(tables) > 0 else 1)"
    if ($LASTEXITCODE -ne 0) {
        $needsSetup = $true
    }
} catch {
    $needsSetup = $true
}

if ($needsSetup) {
    Write-Host "[WARNING] Database appears empty" -ForegroundColor Yellow
    $response = Read-Host "Setup database now? (y/n)"
    if ($response -eq 'y') {
        Write-Host "[INFO] Resetting database..." -ForegroundColor Yellow
        & ".\venv\Scripts\python.exe" reset_database.py
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[INFO] Seeding database..." -ForegroundColor Yellow
            & ".\venv\Scripts\python.exe" seed.py
        }
    }
} else {
    Write-Host "[OK] Database has tables" -ForegroundColor Green
}

# Start the backend server
Write-Host ""
Write-Host "[6/6] Starting backend server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:         http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  ReDoc:            http://localhost:8000/redoc" -ForegroundColor Green
Write-Host ""
Write-Host "  Default Admin Credentials:" -ForegroundColor Yellow
Write-Host "  Email:    admin@Madrush.com.ng" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 69 -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start uvicorn
& ".\venv\Scripts\uvicorn.exe" main:app --reload --host 0.0.0.0 --port 8000
