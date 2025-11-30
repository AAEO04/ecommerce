# Production Cleanup Job Setup Guide

## Overview

This guide explains how to set up the automated cleanup job for expired pending checkouts in production. The job should run every 15 minutes to prevent database bloat.

---

## Option 1: Linux/Ubuntu Production Server (Recommended)

### 1. Create Systemd Service

Create service file: `/etc/systemd/system/madrush-cleanup.service`

```ini
[Unit]
Description=MAD RUSH Cleanup Expired Checkouts
After=network.target postgresql.service

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/var/www/madrush/backend/monolith
Environment="PATH=/var/www/madrush/backend/monolith/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/var/www/madrush/backend/monolith/venv/bin/python /var/www/madrush/backend/monolith/jobs/cleanup_expired_checkouts.py
StandardOutput=append:/var/log/madrush/cleanup.log
StandardError=append:/var/log/madrush/cleanup-error.log

[Install]
WantedBy=multi-user.target
```

### 2. Create Systemd Timer

Create timer file: `/etc/systemd/system/madrush-cleanup.timer`

```ini
[Unit]
Description=Run MAD RUSH cleanup every 15 minutes
Requires=madrush-cleanup.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=15min
Unit=madrush-cleanup.service

[Install]
WantedBy=timers.target
```

### 3. Enable and Start

```bash
# Create log directory
sudo mkdir -p /var/log/madrush
sudo chown www-data:www-data /var/log/madrush

# Reload systemd
sudo systemctl daemon-reload

# Enable timer to start on boot
sudo systemctl enable madrush-cleanup.timer

# Start timer
sudo systemctl start madrush-cleanup.timer

# Check status
sudo systemctl status madrush-cleanup.timer
sudo systemctl list-timers | grep madrush
```

### 4. View Logs

```bash
# View cleanup logs
sudo tail -f /var/log/madrush/cleanup.log

# View errors
sudo tail -f /var/log/madrush/cleanup-error.log

# Check service status
sudo systemctl status madrush-cleanup.service
```

---

## Option 2: Cron Job (Alternative)

### Setup Cron

```bash
# Edit crontab
crontab -e

# Add this line to run every 15 minutes
*/15 * * * * cd /var/www/madrush/backend/monolith && /var/www/madrush/backend/monolith/venv/bin/python jobs/cleanup_expired_checkouts.py >> /var/log/madrush/cleanup.log 2>&1
```

---

## Option 3: Windows Server (Task Scheduler)

### 1. Create PowerShell Script

Save as `C:\madrush\cleanup_job.ps1`:

```powershell
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
    Set-Location "C:\madrush\backend\monolith"
    
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
```

### 2. Create Task Scheduler Task

**Using PowerShell (as Administrator):**

```powershell
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\madrush\cleanup_job.ps1"

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 15) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Register-ScheduledTask -TaskName "MAD RUSH Cleanup Job" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Cleans up expired pending checkouts every 15 minutes" `
    -User "SYSTEM"
```

**Or using Task Scheduler GUI:**

1. Open Task Scheduler
2. Create Basic Task
3. Name: "MAD RUSH Cleanup Job"
4. Trigger: Daily, repeat every 15 minutes
5. Action: Start a program
   - Program: `PowerShell.exe`
   - Arguments: `-ExecutionPolicy Bypass -File C:\madrush\cleanup_job.ps1`
6. Finish and enable

---

## Option 4: Docker/Kubernetes

### Docker Compose

Add to `docker-compose.yml`:

```yaml
services:
  cleanup-job:
    build: ./backend
    command: >
      sh -c "while true; do
        python /app/jobs/cleanup_expired_checkouts.py;
        sleep 900;
      done"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped
```

### Kubernetes CronJob

Create `cleanup-cronjob.yaml`:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: madrush-cleanup
spec:
  schedule: "*/15 * * * *"  # Every 15 minutes
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: madrush-backend:latest
            command: ["python", "/app/jobs/cleanup_expired_checkouts.py"]
            env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: madrush-secrets
                  key: database-url
          restartPolicy: OnFailure
```

Apply:
```bash
kubectl apply -f cleanup-cronjob.yaml
```

---

## Monitoring & Alerts

### 1. Check Job is Running

**Linux (systemd):**
```bash
sudo systemctl status madrush-cleanup.timer
sudo journalctl -u madrush-cleanup.service -f
```

**Linux (cron):**
```bash
grep CRON /var/log/syslog | grep cleanup
```

**Windows:**
```powershell
Get-ScheduledTask -TaskName "MAD RUSH Cleanup Job"
Get-Content C:\madrush\logs\cleanup.log -Tail 20
```

### 2. Database Query to Check

```sql
-- Check for expired pending checkouts
SELECT COUNT(*) as expired_count
FROM pending_checkouts
WHERE status = 'pending' 
AND expires_at < NOW();

-- Should be 0 or very low if cleanup is working

-- Check cleanup is running (look for 'expired' status)
SELECT status, COUNT(*) 
FROM pending_checkouts 
GROUP BY status;
```

### 3. Set Up Alerts

**Option A: Simple Email Alert (Linux)**

Add to cleanup script or cron:
```bash
#!/bin/bash
RESULT=$(python jobs/cleanup_expired_checkouts.py)
if [ $? -ne 0 ]; then
    echo "Cleanup job failed: $RESULT" | mail -s "MAD RUSH Cleanup Failed" admin@example.com
fi
```

**Option B: Monitoring Service**

Use services like:
- **Cronitor** - Monitor cron jobs
- **Healthchecks.io** - Ping-based monitoring
- **Datadog** - Full observability
- **Sentry** - Error tracking

---

## Testing

### Manual Test

```bash
# Run cleanup manually
cd /path/to/madrush/backend/monolith
python jobs/cleanup_expired_checkouts.py
```

### Create Test Data

```sql
-- Create an expired pending checkout for testing
INSERT INTO pending_checkouts (
    idempotency_key, 
    payment_reference, 
    checkout_data, 
    status, 
    created_at, 
    expires_at
) VALUES (
    'test-' || gen_random_uuid()::text,
    'test-ref-' || gen_random_uuid()::text,
    '{"test": true}',
    'pending',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour'
);

-- Run cleanup
-- Then check it was marked as expired:
SELECT * FROM pending_checkouts WHERE status = 'expired' ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

### Job Not Running

1. **Check service/timer is enabled:**
   ```bash
   sudo systemctl is-enabled madrush-cleanup.timer
   sudo systemctl is-active madrush-cleanup.timer
   ```

2. **Check logs for errors:**
   ```bash
   sudo journalctl -u madrush-cleanup.service -n 50
   ```

3. **Test script manually:**
   ```bash
   cd /var/www/madrush/backend/monolith
   ./venv/bin/python jobs/cleanup_expired_checkouts.py
   ```

### Database Connection Issues

1. Check DATABASE_URL environment variable
2. Verify database credentials
3. Check network connectivity
4. Review PostgreSQL logs

### Permission Issues

```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/madrush

# Fix permissions
sudo chmod +x /var/www/madrush/backend/monolith/jobs/cleanup_expired_checkouts.py
```

---

## Recommended Setup

For **production**, use:
- **Linux**: Systemd timer (most reliable)
- **Windows**: Task Scheduler with PowerShell script
- **Docker**: Docker Compose service or Kubernetes CronJob

**Frequency**: Every 15 minutes (can adjust based on traffic)

**Monitoring**: Set up alerts for failures

**Logging**: Rotate logs to prevent disk space issues
