@echo off
echo Copying admin files to admin-frontend...

REM Create directories
mkdir admin-frontend\src\pages 2>nul
mkdir admin-frontend\src\components 2>nul
mkdir admin-frontend\src\services 2>nul

REM Copy pages
xcopy /Y frontend\src\pages\*.js admin-frontend\src\pages\
echo Copied pages

REM Copy components (Layout and Sidebar for admin)
xcopy /Y frontend\src\components\Layout.js admin-frontend\src\components\
xcopy /Y frontend\src\components\Sidebar.js admin-frontend\src\components\
echo Copied components

REM Copy services
xcopy /Y frontend\src\services\*.js admin-frontend\src\services\
echo Copied services

REM Copy tailwind config
xcopy /Y frontend\tailwind.config.js admin-frontend\
xcopy /Y frontend\postcss.config.js admin-frontend\
echo Copied config files

echo.
echo Done! Now run:
echo cd admin-frontend
echo npm install
echo npm start
pause
