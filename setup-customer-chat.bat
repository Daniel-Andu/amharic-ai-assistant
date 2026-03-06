@echo off
echo Setting up customer-chat...

REM Create directories
mkdir customer-chat\src\services 2>nul

REM Copy API service
xcopy /Y frontend\src\services\api.js customer-chat\src\services\

REM Copy CSS files
xcopy /Y frontend\src\index.css customer-chat\src\

REM Copy tailwind config
xcopy /Y frontend\tailwind.config.js customer-chat\
xcopy /Y frontend\postcss.config.js customer-chat\

REM Update package.json dependencies
echo.
echo Files copied!
echo.
echo Now run:
echo cd customer-chat
echo npm install
echo npm start
pause
