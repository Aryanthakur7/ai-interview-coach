@echo off
:: ─────────────────────────────────────────────────────────────
::  AI Interview Coach — Windows startup script
::  Usage: double-click start.bat  OR  run in cmd
:: ─────────────────────────────────────────────────────────────

echo.
echo  ╔══════════════════════════════════════╗
echo  ║       AI Interview Coach             ║
echo  ╚══════════════════════════════════════╝
echo.

:: Load .env if it exists
if exist backend\.env (
    for /f "tokens=1,2 delims==" %%A in (backend\.env) do (
        set %%A=%%B
    )
)

:: Check API key
if "%GROQ_API_KEY%"=="" (
    echo ERROR: GROQ_API_KEY is not set.
    echo.
    echo   1. Get a free key at https://console.groq.com
    echo   2. Create the file  backend\.env  with:
    echo      GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
    echo.
    pause
    exit /b 1
)

echo [OK] GROQ_API_KEY found
echo.

:: ── Backend ──────────────────────────────────────────────────
echo [>>] Setting up backend...
cd backend

python -m venv venv >nul 2>&1
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo [OK] Backend dependencies installed

:: Launch Flask in a new window
start "Flask Backend" cmd /k "call venv\Scripts\activate.bat && python app.py"
echo [OK] Flask starting on http://localhost:5000
cd ..

:: ── Frontend ─────────────────────────────────────────────────
echo.
echo [>>] Setting up frontend...
cd frontend

call npm install --silent
echo [OK] Frontend dependencies installed
echo.
echo ════════════════════════════════════════
echo   App running at → http://localhost:5173
echo ════════════════════════════════════════
echo.

:: Launch Vite in a new window
start "Vite Frontend" cmd /k "npm run dev"

echo Both servers are running in separate windows.
echo Close those windows to stop the app.
echo.
pause
