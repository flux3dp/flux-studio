# FLUX Studio 0.5.0 Change log

### New Feature

-   FLUX Cloud - now you can create an account, bind devices and control it through your mobile phone (requires FLUX App)

### Changes

-   Flux-monitor's middle button behavior, changed from disappear to disable
-   Updated device list format

### Bug Fixes

-   Fixed device list display wrong progress status
-   Fixed unable to turn off camera
-   Fixed double slicing command fired when imported a file
-   Updated svg closepath processing

### Other Improvements

-   Added time and filament cost information
-   Updated IP format pattern
-   Update menu rendering process for faster speed

# FLUX Studio 0.4.3 Change log

### New Features
- added expert parameter "support_everywhere" for Cura Engine

### Bug Fixes
- Cura minimalLayerTime unit

# FLUX Studio 0.4.2 Change log

### New Feature

- Device settings are now available. User can now enable / disable functions such as
  - Calibration
  - Filament detection
  - Toolhead error detection
  - Smart task continuation due to error (#114 - bad connection)
  - UPnP broadcast
- Display current slicing status on bottom left
- Added first layer temperature settings
- Auto pause at Nth layer (beta)
- Load selected image as engraving interface background

### Changes

- User can disable UI/UX improvement tracking through GA
- FS monitor can quit from maintaining mode
- Display calibration data at end of calibration process

### Bug Fixes

- Unable to export scene when model is duplicated through ctrl (cmd) + D
- Not displaying correct SSID name at the end of wifi setup
- Fixed broken tutorial step at loading filament
- Unable to export scene from menu
- Fixed wrong extension when exporting from pen drawing function
- Other minor fixes

### Other Improvements

- Threejs upgraded from version r71 to r80
- Improve file loading speed
- Calibration before checking head (only extruder is allowed)


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
