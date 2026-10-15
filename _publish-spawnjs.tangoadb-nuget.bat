@echo off
@REM Publish SpawnDev.SpawnJS.TangoADB to NuGet.org (newest nupkg in the Release folder).
set projectPath=%~dp0SpawnDev.SpawnJS.TangoADB
set releaseFolder=%projectPath%\bin\Release

@echo:
@echo === SpawnDev.SpawnJS.TangoADB ===

FOR /F "eol=| delims=" %%I IN ('DIR "%releaseFolder%\*.nupkg" /A-D /B /O-D /TW 2^>nul') DO SET "NewestFile=%%I" & GOTO FoundFile
ECHO No *.nupkg file found
GOTO :EOF

:FoundFile
ECHO Latest *.nupkg file is:
ECHO %NewestFile%

@REM Non-interactive push. API key resolution order:
@REM   1. NUGET_API_KEY environment variable, if set (matches `setx NUGET_API_KEY ...`).
@REM   2. Stored credential in %AppData%\Roaming\NuGet\NuGet.Config, set once via:
@REM        nuget setapikey YOUR_KEY -Source https://api.nuget.org/v3/index.json
@REM Crew may run this autonomously per the standing nuget.org publish authority
@REM (D:\users\tj\Projects\CLAUDE.md), but each push requires Captain's explicit
@REM per-push sign-off in conversation. Never run this without a "go" from Captain.
@IF NOT "%NUGET_API_KEY%" == "" (
    dotnet nuget push "%releaseFolder%\%NewestFile%" --api-key %NUGET_API_KEY% --source https://api.nuget.org/v3/index.json
) else (
    dotnet nuget push "%releaseFolder%\%NewestFile%" --source https://api.nuget.org/v3/index.json
)