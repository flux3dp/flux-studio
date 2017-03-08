set PORT=1901
set RULE_NAME="FLUX Discover Port %PORT%"

icacls "%cd%\lib" /grant Everyone:(OI)(CI)f

netsh advfirewall firewall show rule name=%RULE_NAME% >nul

if not ERRORLEVEL 1 (
    rem Rule %RULE_NAME% already exists.
    echo Hey, you already got a out rule by that name, you cannot put another one in!
) else (
    echo Rule %RULE_NAME% does not exist. Creating...
    netsh advfirewall firewall add rule name=%RULE_NAME% dir=in action=allow protocol=UDP localport=%PORT%
)

netsh advfirewall firewall show rule name=FLUX_API >nul

if not ERRORLEVEL 1 (
    rem Rule %RULE_NAME% already exists.
    echo Hey, you already got a out rule by that name, you cannot put another one in!
) else (
    echo Rule %RULE_NAME% does not exist. Creating...
    netsh advfirewall firewall add rule name=FLUX_API dir=in action=allow protocol=ANY program="%cd%\lib\flux_api\flux_api.exe"
)

reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT

if %OS%==32BIT (
    set FILE_NAME=VC_redist.x86.exe
) else (
    set FILE_NAME=VC_redist.x64.exe
)

".\%FILE_NAME%" /install /q /norestart

if %OS%==32BIT (
   set FILE_NAME=dpinst_x86.exe
) else (
   set FILE_NAME=dpinst_x64.exe
)

".\%FILE_NAME%" /S