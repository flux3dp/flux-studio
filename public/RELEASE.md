# FLUX Studio 0.6.2 Change log

### New Features

- Added geometric error correction options in device settings

### Improvement

- Rework on background slicing logic to prevent slice error which might cause unable to click go from slice error or out of bound

# FLUX Studio 0.6.1 Change log

### New Features

- Allow cancel during calibration
- Allow cancel during change filament
- Anti-aliasing setting in preference
- Support .asc export for model scanning


# FLUX Studio 0.6.0 Change log

### New Features

- Orthographic camera view

### Changes

- Uses Cura as default slicing engine
- Improved toolpath previewing colors
- Improved slicing algorithm for printing
- Improved boundary calculation algorithm
- Reduced device selection delay
- Added Load filament button after unloading
- Added more validation before binding machine to cloud

### Bug Fixes

- Fixed tutorial not able to run under certain circumstances
- Fixed fresh installed studio with first laser job will stall the program
- Removed redundant auto reslicing



# FLUX Studio 0.5.0 Change Log

### New Features

- FLUX Cloud - create an account, bind devices and control your Delta through FLUX App

### Changes

- Added time and filament cost information
- Device list, dashboard, preferences style adjustment
- Display behavior of dashboard middle button
- Actively send discovering packets to devices in local network

### Bug Fixes

- Fixed device list displaying wrong progress status
- Fixed unable to turn off camera
- Fixed double slicing command fired when imported a file
- Fixed SVG close-path processing issue

### Other Improvements

- Updated IP format pattern
- Disable unnecessary menu re-rendering

# FLUX Studio 0.4.3 Change log

### New Features
- Added expert parameter "support_everywhere" for Cura Engine

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
- Remove auto resize when importing model, it will display the original size


### Bug Fixes
- Delete file in flux monitor will delete model if model is selected
- when re-slicing after clicked go and encountered error, wrong fcode will be sent to device and cause error
- Cura overhang setting is not working
- Using set default printer function from device menu (default printer is not checked)
- Fixed save task clicked during slicing will not trigger download prompt
- Fixed script error when clicked on the bottom left "complete" notification (when a default device is set)


### Other Improvements
- Flux dashboard should be more responsive
- Calibration will check for head existance
- Slic3r will detect 100% infill with wrong infill pattern
- Added FLUX Studio version information in bug report
- Increase buffer size to prevent file loading freeze
- Update better time estimate for scanning
- Undo function now support add / remove object
- Reconnect when the machine restarts and connect with a different RSA key
