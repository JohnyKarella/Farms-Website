@echo off
title SBL Farms & Nursery - Backend Server
cd /d "%~dp0"

echo ========================================================
echo   Starting SBL Farms Backend Server...
echo ========================================================
echo.

set PYTHON_CMD=python
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=.venv\Scripts\python.exe"
)

echo Using Python: %PYTHON_CMD%

:: Wait 2 seconds then launch admin portal in default browser
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000/admin.html"

:: Run server
%PYTHON_CMD% app.py

pause

