@echo off
@REM Finds the latest Release build nupkg for the library and adds it to the local SpawnDev feed.
set projectPath=%~dp0SpawnDev.SpawnJS.TangoADB
set releaseFolder=%projectPath%\bin\Release
@echo:

FOR /F "eol=| delims=" %%I IN ('DIR "%releaseFolder%\*.nupkg" /A-D /B /O-D /TW 2^>nul') DO SET "NewestFile=%%I" & GOTO FoundFile
ECHO No *.nupkg file found
GOTO :EOF

:FoundFile
ECHO Latest *.nupkg file is:
ECHO %NewestFile%

nuget add "%releaseFolder%\%NewestFile%" -source "D:\users\SpawnDevPackages"
pause
