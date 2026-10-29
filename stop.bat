@echo off
title FinSight AI - Stop Services
cd /d "%~dp0"

echo =====================================================================
echo                    FINSIGHT AI - STOP SERVICES
echo =====================================================================
echo.
echo [*] Terminating FinSight AI processes on ports 8000 and 5173...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$ports = @(8000, 5173); " ^
    "$pids = Get-NetTCPConnection -ErrorAction SilentlyContinue | Where-Object { $ports -contains $_.LocalPort } | Select-Object -ExpandProperty OwningProcess -Unique; " ^
    "if ($pids) { " ^
    "    foreach ($pidNum in $pids) { " ^
    "        try { Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue; Write-Host ('[OK] Stopped process ' + $pidNum) } catch {} " ^
    "    } " ^
    "} else { " ^
    "    Write-Host '[INFO] No running processes found on ports 8000 or 5173.' " ^
    "}"

echo.
echo [OK] Done. All FinSight AI background services have been stopped.
echo.
pause
