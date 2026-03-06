@echo off
echo ========================================
echo Installing Customer Chat Dependencies
echo ========================================
echo.

cd customer-chat

echo [1/3] Cleaning old files...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
)

echo.
echo [2/3] Clearing npm cache...
npm cache clean --force

echo.
echo [3/3] Installing dependencies...
echo This may take 2-5 minutes...
npm install

echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Customer chat is ready!
    echo You can now run: start-all.bat
) else (
    echo FAILED! Check the error messages above.
)
echo ========================================
echo.
pause
