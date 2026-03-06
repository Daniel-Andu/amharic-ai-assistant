@echo off
echo ========================================
echo Restarting Customer Chat
echo ========================================
echo.

echo Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo Starting Backend...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo Starting Customer Chat...
start "Customer Chat" cmd /k "cd customer-chat && npm start"

echo.
echo ========================================
echo Services are starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Customer Chat: http://localhost:3000
echo.
echo Wait for "Compiled successfully!" message
echo Then test voice features!
echo.
pause
