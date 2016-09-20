# FLUX Studio 0.4.1 Change log

### New Feature

- FLUX Delta is now able to connect to hidden SSID during wifi setup through "join network"

### Changes
- remove auto resize when importing model, it will display the original size


### Bug Fixes
- delete file in flux monitor will delete model if model is selected
- when re-slicing after clicked go and encountered error, wrong fcode will be sent to device and cause error
- cura overhang setting is not working
- using set default printer function from device menu (default printer is not checked)
- fixed save task clicked during slicing will not trigger download prompt
- fixed script error when clicked on the bottom left "complete" notification (when a default device is set)


### Other Improvements
- flux monitor should be more responsive
- calibration will check for head existance
- Slic3r will detect 100% infill with wrong infill pattern
- added FLUX Studio version information in bug report
- increase buffer size to prevent file loading freeze
- update better time estimate for scanning
- undo function now support add / remove object
- reconnect when the machine restarts and connect with a different RSA key
