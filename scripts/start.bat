@echo off
title Granules EHS Maturity - Production Server
cd /d "%~dp0\.."
echo Starting Granules EHS Maturity Production Server on http://localhost:3000...
node server.js
pause
