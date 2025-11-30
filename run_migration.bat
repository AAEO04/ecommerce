@echo off
set PGPASSWORD=madrush_password
psql -U madrush_user -d madrush_db -f backend\monolith\create_pending_checkouts.sql
pause
