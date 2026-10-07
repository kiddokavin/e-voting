@echo off
echo =============================================================
echo Pushing Central Monitoring App to GitHub (kiddokavin/monitoring)
echo =============================================================

git init
git add .
git commit -m "Initial commit for Central Monitoring App"
git branch -M main
git remote add origin https://github.com/kiddokavin/monitoring.git 2>nul
git remote set-url origin https://github.com/kiddokavin/monitoring.git
git push -u origin main --force

echo =============================================================
echo Done! Pushed to https://github.com/kiddokavin/monitoring.git
echo =============================================================
pause
