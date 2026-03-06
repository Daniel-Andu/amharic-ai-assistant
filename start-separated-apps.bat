@echo off
echo ========================================
echo Starting AI Assistant System
echo ========================================
echo.
echo This will start 3 applications:
echo 1. Backend (Port 5000)
echo 2. Customer Chat (Port 3000)
echo 3. Admin Dashboard (Port 3001)
echo.
echo Press Ctrl+C in each window to stop
echo ========================================
echo.

REM Start Backend
start "Backend API (Port 5000)" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Customer Chat
start "Customer Chat (Port 3000)" cmd /k "cd customer-chat && npm start"
timeout /t 3 /nobreak >nul

REM Start Admin Dashboard
start "Admin Dashboard (Port 3001)" cmd /k "cd admin-frontend && npm start"

echo.
echo ========================================
echo All services starting...
echo ========================================
echo.
echo URLs:
echo - Customer Chat: http://localhost:3000
echo - Admin Dashboard: http://localhost:3001
echo - Backend API: http://localhost:5000
echo.
echo ========================================
pause
