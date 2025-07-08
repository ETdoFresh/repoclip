@echo off
echo Uninstalling repoclip globally...
echo.

REM Uninstall using npm unlink with package name
call npm unlink -g repoclip

echo.
echo Uninstallation complete!
echo The 'repoclip' command has been removed from your system.
echo.