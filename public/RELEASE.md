# FLUX Studio 0.7.0 Change log

### New Features

-   Supports direct USB connection for FLUX Delta+ and Upgrade Kits
-   Supports HD camera for FLUX Delta+ and Upgrade Kits
-   Supports CuraEngine 2.4 ( You can disable it by setting cura2 = 0 )
-   Parameter "xy_size_compensation" now works with CuraEngine 2.4, which might alter the size of your printing results.
-   Allows changing filaments in pausing state
-   Allows changing toolhead temperature in pausing state
-   Device list will now indicate the type of connection
-   Supports switching machine profile for Delta+
-   Adds scale inputs in object properties dialog
-   Adds a snapshot button in camera monitoring interface
-   Adds a height offset parameter to engraving interface
-   Adds a built-in calibration image in laser advanced-settings
-   The new default skirt will circle the work area

### Bug Fixes

-   Fixed the software being unable to cancel load filament in the tutorial
-   Fixed "changing filaments, updating firmware" features for machines in completed / aborted status
-   Fixed displaying the button for removing laser background
-   Fixed object border not being synced after resize or duplicating in printing interface
-   Fixed task thumbnails scaling ratio
-   Fixed the masking of out-ranged engraving image
-   Fixed raft interface printing temperature is too high
-   Fixed the power setting for bitmap engraving, now it's working

### Change

-   New default printing parameters
-   Rename all "device" and "Delta" into "machine" and "the machine"
-   Move configuration reset button into preferences interface
-   Display device model name in Machine Info

### Other Improvements

- Adds new tutorial guiding images for FLUX Delta+ / Upgrade Kits

# FLUX Studio 0.6.3 Change log (20170124)

### New Feature

- Manually set printing toolhead temperature from menu > device > commands > set toolhead temperature

### Bug Fixes

- Fix possible .svg file import error that causes unable to engrave

### Other Improvements

- Confirm responses from the slicing engine (slic3r and cura) before allowing file import, which might cause error
- Update 3D rendering engine (threejs) from r80 to r83
- Add rotation color indicator (x,y,z) in object dialogue
- Update object dialogue position during object transforming
- Display errors when imported gcode is out of printing area

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
