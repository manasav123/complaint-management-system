@echo off
title AI Complaint Management System

cd /d C:\Users\manas\complaint-management-system

start "Backend" cmd /k "backend\venv\Scripts\activate && python -m uvicorn backend.main:app --reload"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 5 /nobreak >nul

start http://localhost:5174
