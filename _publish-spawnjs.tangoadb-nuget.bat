@echo off
@REM Finds the latest Release nupkg for the library, confirms, asks for the api key, then publishes to nuget.org.
set projectPath=%~dp0SpawnDev.SpawnJS.TangoADB
set releaseFolder=%projectPath%\bin\Release
@echo:

FOR /F "eol=| delims=" %%I IN ('DIR "%releaseFolder%\*.nupkg" /A-D /B /O-D /TW 2^>nul') DO SET "NewestFile=%%I" & GOTO FoundFile
ECHO No *.nupkg file found
GOTO :EOF

:FoundFile
ECHO Latest *.nupkg file is:
ECHO %NewestFile%

setlocal
:PROMPT
SET /P AREYOUSURE=Publish this package? y/[N]?

IF /I "%AREYOUSURE%" NEQ "Y" GOTO END

set /p apikey=Enter api key:
@IF NOT [%apikey%] == [] (
    dotnet nuget push "%releaseFolder%\%NewestFile%" --api-key %apikey% --source https://api.nuget.org/v3/index.json
) else (
    @echo Cancelled
)
:END
endlocal

pause
