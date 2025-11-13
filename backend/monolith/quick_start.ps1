# Quick Backend Start Script
# Activates venv and starts the server immediately

Write-Host "🚀 Starting MadRush Backend..." -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location "$PSScriptRoot"

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Backend API:      http://localhost:8000" -ForegroundColor Green
Write-Host "  API Docs:         http://localhost:8000/docs" -ForegroundColor Green
Write-Host "  Admin:            admin@madrush.com / admin123" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Start uvicorn
& ".\venv\Scripts\uvicorn.exe" main:app --reload --host 0.0.0.0 --port 8000
