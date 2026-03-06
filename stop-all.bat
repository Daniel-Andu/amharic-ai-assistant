@echo off
echo ========================================
echo Stopping AI Assistant System
echo ========================================
echo.

echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo All services stopped.
echo.
pause
