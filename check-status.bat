@echo off
echo ========================================
echo   System Status Check
echo ========================================
echo.

echo Checking Backend (Port 5000)...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo [OK] Backend is running on port 5000
) else (
    echo [ERROR] Backend is NOT running!
    echo Run: cd backend && npm run dev
)
echo.

echo Checking Frontend (Port 3000)...
netstat -ano | findstr :3000
if %errorlevel% equ 0 (
    echo [OK] Frontend is running on port 3000
) else (
    echo [ERROR] Frontend is NOT running!
    echo Run: cd frontend && npm start
)
echo.

echo Checking PostgreSQL (Port 5432)...
netstat -ano | findstr :5432
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running on port 5432
) else (
    echo [WARNING] PostgreSQL might not be running
    echo Check Windows Services for PostgreSQL
)
echo.

echo ========================================
echo   Quick Actions
echo ========================================
echo.
echo To start backend:  cd backend  && npm run dev
echo To start frontend: cd frontend && npm start
echo To check health:   curl http://localhost:5000/api/health
echo.
pause
