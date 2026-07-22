@echo off
cd /d "%~dp0"
py start_server.py
if errorlevel 1 python start_server.py
pause
