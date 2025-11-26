@echo off
cd C:\Users\tejas\Desktop\HireHub\HireHub
git add backend/src backend/.env
git commit -m "Fix: Protect /my-recent route and add comprehensive token endpoint logging"
git push origin main
pause
