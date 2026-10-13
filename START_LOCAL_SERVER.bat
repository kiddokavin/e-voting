@echo off
cd /d "%~dp0"
title Centralized E-Voting System - Local Server
color 0A
cls
echo =====================================================================
echo       TAMIL NADU GOVT SECURE NETWORK BASED E-VOTING SYSTEM
echo =====================================================================
echo.
echo [*] Starting Local Node.js Backend Server on port 3000...
echo [*] Directory: %CD%
echo [*] Target Officer Alert Mobile: +91 9442218610 (Thiru. L. Kavin)
echo.
echo [*] Opening Browser at http://localhost:3000 in 2 seconds...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo.
echo [*] Server is now RUNNING on http://localhost:3000
echo [*] Mobile Push Alerts and SMS will dispatch via your Laptop's Internet.
echo [*] Keep this command window open while using the system.
echo.
node server.js
pause
