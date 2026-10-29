@echo off
setlocal EnableDelayedExpansion
title FinSight AI - Application Launcher

:: Change directory to project root
cd /d "%~dp0"

echo =====================================================================
echo                  FINSIGHT AI - APPLICATION LAUNCHER
echo =====================================================================
echo.

:: 1. Check Python / Virtual Environment
echo [*] Checking Python environment...
set "VENV_ACTIVATE=%~dp0.venv\Scripts\activate.bat"

if exist "%VENV_ACTIVATE%" (
    echo [OK] Found virtual environment in .venv
) else (
    where python >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Python was not found in your system PATH or in .venv!
        echo Please install Python 3.10+ or configure the .venv directory.
        pause
        exit /b 1
    )
    echo [WARN] .venv not detected. Using system Python.
)

:: 2. Check Node.js and NPM
echo [*] Checking Node.js and npm...
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/ to run the frontend.
    pause
    exit /b 1
)
echo [OK] Node.js and npm found.

:: 3. Check frontend node_modules
if not exist "%~dp0frontend\node_modules" (
    echo [*] Frontend dependencies not found. Installing node_modules...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
)

echo.
echo [*] Starting FinSight AI Backend (FastAPI on port 8000)...
if exist "%VENV_ACTIVATE%" (
    start "FinSight AI - Backend" /d "%~dp0backend" cmd /k "title FinSight AI - Backend && call "..\.venv\Scripts\activate.bat" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
) else (
    start "FinSight AI - Backend" /d "%~dp0backend" cmd /k "title FinSight AI - Backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
)

echo [*] Starting FinSight AI Frontend (Vite React on port 5173)...
start "FinSight AI - Frontend" /d "%~dp0frontend" cmd /k "title FinSight AI - Frontend && npm run dev"

echo.
echo [*] Waiting for services to initialize...
timeout /t 4 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 5 >nul

echo [*] Opening FinSight AI in your browser...
start "" "http://localhost:5173"

echo.
echo =====================================================================
echo                FinSight AI is running successfully!
echo.
echo   Frontend App:   http://localhost:5173
echo   Backend API:    http://127.0.0.1:8000
echo   API Docs:       http://127.0.0.1:8000/docs
echo =====================================================================
echo.
echo Note: Keep the Backend and Frontend terminal windows open while using the app.
echo To stop FinSight AI, close the backend/frontend windows or run stop.bat.
echo.
pause
