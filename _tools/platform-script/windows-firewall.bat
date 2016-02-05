set PORT=1901
set RULE_NAME="FLUX Discover Port %PORT%"

netsh advfirewall firewall show rule name=%RULE_NAME% >nul

if not ERRORLEVEL 1 (
    rem Rule %RULE_NAME% already exists.
    echo Hey, you already got a out rule by that name, you cannot put another one in!
) else (
    echo Rule %RULE_NAME% does not exist. Creating...
    netsh advfirewall firewall add rule name=%RULE_NAME% dir=in action=allow protocol=UDP localport=%PORT%
)