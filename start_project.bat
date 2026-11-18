@echo off
title CampusCare - AI Complaint Management System

cd /d C:\Users\manas\complaint-management-system

echo Starting CampusCare Backend...

start "Backend" cmd /k "backend\venv\Scripts\activate && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload"

timeout /t 5 /nobreak >nul

echo Starting CampusCare Frontend...

start "Frontend" cmd /k "cd /d C:\Users\manas\complaint-management-system\frontend && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5173

echo CampusCare started!