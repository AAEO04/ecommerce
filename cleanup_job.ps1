# MAD RUSH Cleanup Job
$ErrorActionPreference = "Stop"
$LogFile = "C:\madrush\logs\cleanup.log"
$ErrorLog = "C:\madrush\logs\cleanup-error.log"

# Create log directory if it doesn't exist
$LogDir = Split-Path $LogFile -Parent
if (!(Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force
}

# Log start
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $LogFile -Value "[$timestamp] Starting cleanup job..."

try {
    # Change to project directory
    Set-Location "C:\Users\allio\Desktop\madrush\backend\monolith"
    
    # Activate virtual environment and run cleanup
    & ".\venv\Scripts\python.exe" ".\jobs\cleanup_expired_checkouts.py"
    
    if ($LASTEXITCODE -eq 0) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Add-Content -Path $LogFile -Value "[$timestamp] Cleanup completed successfully"
    } else {
        throw "Python script exited with code $LASTEXITCODE"
    }
} catch {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $errorMsg = $_.Exception.Message
    Add-Content -Path $ErrorLog -Value "[$timestamp] ERROR: $errorMsg"
    Add-Content -Path $LogFile -Value "[$timestamp] Cleanup failed: $errorMsg"
    exit 1
}
