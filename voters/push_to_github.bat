@echo off
echo ========================================================
echo Pushing Voters Terminal App to GitHub (kiddokavin/voters)
echo ========================================================

git init
git add .
git commit -m "Initial commit for Voters Terminal App"
git branch -M main
git remote add origin https://github.com/kiddokavin/voters.git 2>nul
git remote set-url origin https://github.com/kiddokavin/voters.git
git push -u origin main --force

echo ========================================================
echo Done! Pushed to https://github.com/kiddokavin/voters.git
echo ========================================================
pause
