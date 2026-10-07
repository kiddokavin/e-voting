@echo off
echo ========================================================
echo Pushing Admin Control App to GitHub (kiddokavin/admin)
echo ========================================================

git init
git add .
git commit -m "Initial commit for Admin Control Station App"
git branch -M main
git remote add origin https://github.com/kiddokavin/admin.git 2>nul
git remote set-url origin https://github.com/kiddokavin/admin.git
git push -u origin main --force

echo ========================================================
echo Done! Pushed to https://github.com/kiddokavin/admin.git
echo ========================================================
pause
