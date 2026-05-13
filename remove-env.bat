@echo off
cd /d "c:\PRIVATE\AI\1. DEFINITIVNO\My-Web-Page"
echo === Git Status Before ===
git status

echo.
echo === Removing .env from Git cache ===
git rm --cached .env

echo.
echo === Adding changes ===
git add .

echo.
echo === Committing changes ===
git commit -m "Remove .env from tracking — added to gitignore"

echo.
echo === Git Status After ===
git status

pause
