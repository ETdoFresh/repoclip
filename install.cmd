@echo off
echo Installing repoclip globally...
echo.

REM Build the TypeScript project first
echo Building TypeScript...
call npm run build

REM Install globally using npm link (for development) or npm install -g
echo.
echo Installing globally...
call npm link

echo.
echo Installation complete!
echo You can now run 'repoclip' from anywhere.
echo.