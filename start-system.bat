@echo off
echo ========================================
echo   AI Assistant System Startup
echo ========================================
echo.

echo Checking system...
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

REM Check if frontend directory exists
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Starting Backend Server...
echo.
start cmd /k "cd backend && echo Starting Backend... && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend...
echo.
start cmd /k "cd frontend && echo Starting Frontend... && npm start"

echo.
echo ========================================
echo   System Starting!
echo ========================================
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will open at: http://localhost:3000
echo.
echo Two terminal windows will open:
echo   1. Backend (keep running)
echo   2. Frontend (keep running)
echo.
echo Press Ctrl+C in each window to stop
echo.
echo ========================================
pause
