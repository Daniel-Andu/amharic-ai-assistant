@echo off
echo ========================================
echo Starting AI Assistant System
echo ========================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Admin Dashboard (Port 3001)...
start "Admin Dashboard" cmd /k "cd admin-frontend && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Customer Chat (Port 3000)...
start "Customer Chat" cmd /k "cd customer-chat && npm start"

echo.
echo ========================================
echo All services are starting...
echo ========================================
echo.
echo Backend API:      http://localhost:5000
echo Admin Dashboard:  http://localhost:3001
echo Customer Chat:    http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
