define(function() {
    'use strict';

    return {
        general: {
            wait: 'Processing, please wait'
        },
        buttons: {
            next: 'NEXT'
        },
        topbar: {
            titles: {
                settings: 'Preferences'
            },
            zoom: 'Zoom',
            group: 'Group',
            ungroup: 'Ungroup',
            halign: 'HAlign',
            valign: 'VAlign',
            hdist: 'HDist',
            vdist: 'VDist',
            left_align: 'Left',
            center_align: 'Center',
            right_align: 'Right',
            top_align: 'Top',
            middle_align: 'Middle',
            bottom_align: 'Bottom',
            union: 'Union',
            subtract: 'Subtract',
            intersect: 'Intersect',
            difference: 'Difference',
            hflip: 'HFlip',
            vflip: 'VFlip',
            export: 'Export'
        },
        support: {
            no_webgl: 'WebGL is not supported. Please use other devices.',
            no_vcredist: 'Please install Visual C++ Redistributable 2015<br/>That can be downloaded on flux3dp.com',
            osx_10_9: 'OS X 10.9 is not supported. Please update to newer version'
        },
        generic_error: {
            UNKNOWN_ERROR: '[UE] Please restart FLUX Studio',
            OPERATION_ERROR: '[OE] A status conflict occured, please retry the action.',
            SUBSYSTEM_ERROR: '[SE] Please restart the machine',
            UNKNOWN_COMMAND: '[UC] Please update the Delta+/Delta Firmware',
            RESOURCE_BUSY: '[RB] Please restart  the machine, or try again'
        },
        device_selection: {
            no_printers: 'Cannot detect any machine through the Wi-Fi. Please check if your PC and machine are under the same network. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215394548">More Info</a>',
            no_beambox: 'Cannot detect any machine through the Wi-Fi. Please check if your PC and machine are under the same network. <a target="_blank" href="https://flux3dp.com/beambox-tutorial/">More Info</a>',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: 'Release Note:',
            firmware: {
                caption: 'A Firmware Update to the machine is available',
                message_pattern_1: '"%s" is now ready for firmware update.',
                message_pattern_2: '%s Firmware v%s is now available - You have v%s.',
                latest_firmware: {
                    caption: 'Machine firmware Update',
                    message: 'You have the latest Machine firmware',
                    still_update: 'UPDATE'
                },
                confirm: 'UPLOAD',
                upload_file: 'Firmware upload (*.bin / *.fxfw)',
                update_success: 'Firmware update successfully uploaded',
                update_fail: 'Update Fail'
            },
            software: {
                caption: 'A Software Update to FLUX Studio is available',
                message_pattern_1: 'FLUX Studio is now ready for software update.',
                message_pattern_2: 'FLUX Software v%s is now available - You have v%s.'
            },
            toolhead: {
                caption: 'A Firmware Update to FLUX Toolhead is available',
                message_pattern_1: '"%s" is now ready for toolhead firmware update.',
                message_pattern_2: 'FLUX Toolhead Firmware %s is now available.',
                latest_firmware: {
                    caption: 'Toolhead Firmware Update',
                    message: 'You have the latest toolhead firmware'
                },
                confirm: 'UPLOAD',
                upload_file: 'Firmware upload (*.bin)',
                update_success: 'Toolhead Firmware update successfully uploaded',
                update_fail: 'Update Fail',
                waiting: 'Please connect the toolhead'
            },
            updating: 'Updating...',
            skip: 'Skip This Version',
            checkingHeadinfo: 'Checking Toolhead Information',
            preparing: 'Preparing...',
            later: 'LATER',
            download: 'ONLINE UPDATE',
            cannot_reach_internet: 'Server is unreachable<br/>Please checking internet connection',
            install: 'INSTALL',
            upload: 'UPLOAD'
        },
        topmenu: {
            version: 'Version',
            sure_to_quit: 'Are you sure you want to quit?',
            flux: {
                label: 'FLUX',
                about: 'About',
                preferences: 'Preferences',
                quit: 'Quit'
            },
            file: {
                label: 'File',
                import: 'Import',
                save_fcode: 'Export FLUX Task',
                save_scene: 'Save Scene',
                all_files: 'All Files',
                bvg_files: 'Beambox Scene',
                fcode_files: 'FLUX Code',
                fsc_files: '3D Printing Scene',
                confirmReset: 'Are you sure you want to reset all settings?'
            },
            edit: {
                label: 'Edit',
                duplicate: 'Duplicate',
                rotate: 'Rotate',
                scale: 'Scale',
                clear: 'Clear Scene',
                undo: 'Undo',
                alignCenter: 'Align Center',
                reset: 'Reset'
            },
            device: {
                label: 'Machines',
                new: 'Machine Setup',
                device_monitor: 'Dashboard',
                device_info: 'Machine Info',
                head_info: 'Toolhead Info',
                change_filament: 'Change Printing Material',
                default_device: 'Set as Default',
                check_firmware_update: 'Update Firmware',
                update_delta: 'Machine Firmware',
                update_toolhead: 'Toolhead Firmware',
                calibrate: 'Run Auto Leveling',
                set_to_origin: 'Calibrate Origin ( Home )',
                movement_tests: 'Run Movement Tests',
                scan_laser_calibrate: 'Turn On Scanning Laser',
                clean_calibration: 'Run Auto Leveling with Clean Data',
                commands: 'Commands',
                set_to_origin_complete: 'The machine has calibrated its origin.',
                scan_laser_complete: 'The machine has turned on its scanning laser. Click "Finish" to turn it off.',
                movement_tests_complete: 'Movement tests completed',
                movement_tests_failed: 'Movement tests failed. <br/>1. Make sure the toolhead cable is stretched correctly.<br/>2. Make sure the connector of toolhead cable to the machine has inserted about half into the machine.<br/>3. Try to turn the connector on the printing toolhead 180 degrees.<br/>4. Check <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/115003674128">this article</a>.',
                download_log: 'Download Logs',
                download_log_canceled: 'Log download canceled',
                download_log_error: 'Unknown error occurred, please try it again later',
                log: {
                    network: 'Network',
                    hardware: 'Hardware',
                    discover: 'Discover',
                    usb: 'USB',
                    camera: 'Camera',
                    cloud: 'Cloud',
                    player: 'Player',
                    robot: 'Robot'
                },
                finish: 'FINISH',
                cancel: 'CANCEL',
                turn_on_head_temperature: 'Set Toolhead Temperature'
            },
            window: {
                label: 'Window',
                minimize: 'Minimize',
                fullscreen: 'Fullscreen'
            },
            help: {
                label: 'Help',
                help_center: 'Help Center',
                contact: 'Contact Us',
                tutorial: 'Start Printing Tutorial',
                software_update: 'Software Update',
                debug: 'Bug Report',
                forum: 'Community Forum'
            },
            account: {
                label: 'Account',
                sign_in: 'Sign In',
                sign_out: 'Sign Out'
            }
        },
        initialize: {
            // generic strings
            next: 'Next',
            start: 'START',
            skip: 'Skip',
            cancel: 'CANCEL',
            confirm: 'CONFIRM',
            connect: 'Connect',
            back: 'Back',
            retry: 'RETRY',
            no_machine: 'I don\'t have a machine now.',

            // specific caption/content
            invalid_device_name: 'The name can only contains chinese, alphabet, numbers, blanks, and special characters  ( ) - _ ’ \'',
            require_device_name: 'Name is required',
            select_language: 'Select Language',
            change_password: {
                content: 'Are you sure to change the password?',
                caption: 'Changing password'
            },
            connect_flux: 'Connect the Machine',
            via_usb: 'Using USB Cable',
            via_wifi: 'Using Wi-Fi',
            select_machine_type: 'Please select the machine',
            select_beambox_type: 'Please select the beambox type',
            name_your_flux: 'Name Your Machine',
            wifi_setup: 'Wi-Fi Setup',
            select_preferred_wifi: 'Select your preferred network.',
            requires_wifi_password: 'requires a password.',
            connecting: 'Connecting...',

            // page specific
            connect_beambox: {
                set_beambox_connection: 'Set Beambox Connection',
                please_goto_touchpad: 'Please go to Beambox touchpad',
                tutorial: '1. Click touchpad "Setting" > "Internet" > "Setting."\n2. Select your WiFi and enter the password.\n3. Wait 10 seconds, the Wireless IP Address would show at "Setting" > "Internet".',
                please_see_tutorial_video: 'Tutorial Video',
                tutorial_url: 'https://flux3dp.com/beambox-tutorial/'
            },

            connect_beamo: {
                set_beamo_connection: 'Set Beamo Connection',
                please_goto_touchpad: 'Please go to Beamo touchpad',
                tutorial: '1. Click touchpad "Setting" > "Internet" > "Setting."\n2. Select your WiFi and enter the password.\n3. Wait 10 seconds, the Wireless IP Address would show at "Setting" > "Internet".',
                please_see_tutorial_video: 'Tutorial Video',
                tutorial_url: 'https://tw.flux3dp.com/beamo-tutorial/'
            },

            set_machine_generic: {
                printer_name: 'Name*',
                printer_name_placeholder: 'Give your machine an unique name',
                old_password: 'Current Password',
                password: 'Password',
                set_station_mode: 'Create a Network',
                password_placeholder: 'Secure your machine with password',
                incorrect_old_password: 'Incorrect Current Password',
                incorrect_password: 'Incorrect Password',
                ap_mode_name: 'Network Name',
                ap_mode_pass: 'Password',
                ap_mode_name_format: 'Only accept alphabets or numbers',
                ap_mode_pass_format: 'At least 8 characters',
                ap_mode_name_placeholder: 'Up to 32 characters.',
                ap_mode_pass_placeholder: 'Must have at least 8 characters.',
                create_network: 'Create Network',
                join_network: 'Join Other Network',
                security: 'Security'
            },

            setting_completed: {
                start: 'Start',
                is_ready: '“%s” is ready',
                station_ready_statement: 'Your machine is now a Wi-Fi station, you can use your machine wirelessly by connect to Wi-Fi “%s”',
                brilliant: 'Brilliant!',
                begin_journey: 'You can now detach USB / Micro USB Cable, and begin the journey of creativity.',
                great: 'Welcome to FLUX Studio',
                upload_via_usb: 'You can setup Wi-Fi connection later. <br/>If you don\'t have Wi-Fi, check <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215998327-Connection-Guide-for-Desktop-PCs">Desktop Connection Guide</a>.',
                back: 'Back',
                ok: 'START CREATING'
            },

            notice_from_device: {
                headline: 'Check the Wi-Fi Indicator on your machine',
                subtitle: 'Please mind the status of Wi-Fi connection.',
                light_on: 'Light On',
                light_on_desc: 'The machine has connected to the Wi-Fi you assigned',
                breathing: 'Breathing',
                breathing_desc: 'Wi-Fi connection failed. Please try setting again.',
                successfully: 'If the machine connect successfully',
                successfully_statement: 'Please go back to your Wi-Fi list and connect your PC to %s, then restart FLUX Studio',
                restart: 'Restart FLUX Studio'
            },

            // errors
            errors: {
                error: 'Error',
                close: 'close',
                not_found: 'Not Found',
                not_support: 'Please update Machine Firmware to v1.6+, through USB',

                keep_connect: {
                    caption: 'USB Connection not found',
                    content: 'Oops! Don\'t worry. We\'re here for you.\nMake sure\n1. The Wi-Fi Indicator (green led) is flashing, breathing or being steady on.\n2. The driver is correctly installed. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215327328">(More Info)</a>\n3. Try replug it and wait for 10 sec.'
                },

                wifi_connection: {
                    caption: 'Unable to connect',
                    connecting_fail: 'Please make sure the Wi-Fi signal is strong and the password is correct.'
                },

                select_wifi: {
                    ap_mode_fail: 'Setup Failed.'
                }
            }
        },
        wifi: {
            home: {
                line1: 'Do you have available Wi-Fi could be able access?',
                line2: 'We are helping your FLUX to connecting to Wi-Fi',
                select: 'Yes'
            },
            set_password: {
                line1: '請輸入「',
                line2: '」無線網路的連線密碼',
                password_placeholder: '請輸入 Wi-Fi 密碼',
                back: 'Back',
                join: 'Join',
                connecting: 'Connecting'
            },
            success: {
                caption: '太棒了，連線成功!',
                line1: '接下來，我們將為你的機器做一些簡單的設定。',
                next: '下一步'
            },
            failure: {
                caption: '連線失敗',
                line1: '請確認你的 Wi-Fi 是否正常運作後，再重新連線',
                next: '重新連線'
            },
            set_printer: {
                caption: '為你的 FLUX3D Printer 設定名稱與密碼',
                printer_name: '名稱',
                printer_name_placeholder: '設定名稱',
                password: '密碼',
                password_placeholder: '設定密碼',
                notice: '設定密碼，可以確保你的 FLUX Delta 只有知道密碼的人可以操作',
                next: '下一步'
            }
        },
        menu: {
            print: 'PRINT',
            laser: 'ENGRAVE',
            scan: 'SCAN',
            usb: 'USB',
            device: 'Machine',
            setting: 'SETTING',
            draw: 'DRAW',
            cut: 'CUT',
            beambox: 'BEAMBOX',
            mill: 'MILL',
            mm: 'mm',
            inches: 'Inches'
        },
        settings: {
            on: 'On',
            off: 'Off',
            caption: 'Settings',
            tabs: {
                general: 'General',
                device: 'Machine'
            },
            ip: 'Machine IP Address',
            wrong_ip_format: 'Wrong IP Formats',
            lock_selection: 'Lock Selection',
            default_machine: 'Default Machine',
            default_machine_button: 'Empty',
            remove_default_machine_button: 'Remove',
            confirm_remove_default: 'Default machine is going to be removed.',
            reset: 'Reset FLUX Studio',
            reset_now: 'Reset FLUX Studio',
            confirm_reset: 'Confirm reset FLUX Studio?',
            language: 'Language',
            notifications: 'Notifications',
            default_app: 'Default App',
            default_units: 'Default Units',
            loop_compensation: 'Loop Compensation',
            delta_series: 'Delta Family',
            beambox_series: 'Beambox Family',
            default_model: 'Default Model<br />(For Print Settings)',
            default_beambox_model: 'Default Model',
            guides_origin: 'Guides Origin',
            guides: 'Guides',
            none: 'None',
            close: 'Close',
            cancel: 'CANCEL',
            done: 'DONE',
            groups: {
                general: 'General',
                connection: 'Connection',
                editor: 'Editor',
                path: 'Path'
            },
            connect_printer: {
                title: 'Connect with your printer'
            },
            notification_on: 'On',
            notification_off: 'Off',
            engine_change_fail: {
                'caption': 'unable to change engine ',
                '1': 'error during checking',
                '2': 'cura version error',
                '3': 'path is not cura',
                '4': 'path is not a exist file, please check engine path in setting section'
            },
            allow_tracking: 'Would you like to send anonymous usage statistics to FLUX to improve the app?',
            flux_cloud: {
                processing: 'Processing...',
                flux_cloud: 'FLUX CLOUD',
                back: 'BACK',
                next: 'NEXT',
                done: 'DONE',
                sign_in: 'SIGN IN',
                sign_up: 'SIGN UP',
                success: 'SUCCESS',
                fail: 'FAIL',
                cancel: 'CANCEL',
                try_again: 'TRY AGAIN',
                bind: 'BIND',
                bind_another: 'BIND ANOTHER',
                username: 'Username',
                nickname: 'Nickname',
                email: 'Email',
                password: 'Password',
                re_enter_password: 'Re-Enter Password',
                forgot_password: 'Forgot your password?',
                sign_up_statement: 'If you don\'t have a FLUX ID, please <a href="%s">SIGN UP</a> here',
                try_sign_up_again: 'Please try <a href="%s">SIGN UP</a> again',
                agreement: 'Agree to the FLUX <a href="#/studio/cloud/privacy">Privacy</a>, <a href="#/studio/cloud/terms">Terms & Conditions</a>',
                pleaseSignIn: 'Please sign in with your FLUX ID',
                enter_email: 'Please fill in your email address',
                check_inbox: 'Go and check your mail box!',
                error_blank_username: 'Nickname can\'t be blank',
                error_blank_email: 'Email cannot be blank',
                error_email_format: 'Please provide a correct email',
                error_email_used: 'The email address has been used',
                error_password_not_match: 'Password does not match the confirm password.',
                select_to_bind: 'Select a machine to bind',
                binding_success: 'You have successfully bound your machine!',
                binding_success_description: 'You can now use FLUX app to check your machine status',
                binding_fail: 'Binding failed',
                binding_fail_description: 'May due to network error. Try it again',
                binding_error_description: 'Unable to turn on cloud feature of the machine. Please contact support with the error log',
                retrieve_error_log: 'Download error',
                binding: 'Binding...',
                check_email: 'Please check your email for instruction',
                email_exists: 'Email exists',
                not_verified: 'Email has not been verified',
                user_not_found: 'Incorrect Email or Password',
                resend_verification: 'Resend verification email',
                contact_us: 'Please contact FLUX support with your email and issue you encountered',
                confirm_reset_password: 'Reset your password?',
                format_error: 'Incorrect credentials',
                agree_to_terms: 'Please agree to terms',
                back_to_list: 'Back To List',
                change_password: 'Change password',
                current_password: 'Current Password',
                new_password: 'New Password',
                confirm_password: 'Confirm Password',
                empty_password_warning: 'Password cannot be empty',
                WRONG_OLD_PASSWORD: 'Incorrect Current Password',
                FORMAT_ERROR: 'Wrong password format',
                submit: 'SAVE',
                sign_out: 'Sign out',
                not_supported_firmware: 'Please upgrade your machine firmware\nto v1.5+ for cloud feature',
                unbind_device: 'Would you like to unbind this machine?',
                CLOUD_SESSION_CONNECTION_ERROR: 'The machine is unable to access to the cloud server. Please reboot the machine.',
                CLOUD_UNKNOWN_ERROR: 'The machine is unable to connected to the cloud server. Please reboot the machine.',
                SERVER_INTERNAL_ERROR: 'Server internal error, please try again later.',
            }
        },
        print: {
            import: 'IMPORT',
            save: 'Save',
            start_print: 'Print',
            gram: 'g',
            advanced: {
                general: 'General',
                layers: 'Layers',
                infill: 'Infill',
                support: 'Support',
                speed: 'Speed',
                custom: 'Text',
                slicingEngine: 'Slicing Engine',
                slic3r: 'Slic3r',
                cura: 'Cura',
                cura2: 'Cura2',
                filament: 'Filament',
                temperature: 'Material & Temperature',
                detect_filament_runout: 'Filament Detection',
                flux_calibration: 'Auto Calibration',
                detect_head_tilt: 'Tilt Detection',
                layer_height_title: 'Layer Height',
                layer_height: 'Layer Height',
                firstLayerHeight: 'First Layer Height',
                shell: 'Shell',
                shellSurface: 'Shell Surface',
                solidLayerTop: 'Solid Layer: Top',
                solidLayerBottom: 'Solid Layer: Bottom',
                density: 'Density',
                pattern: 'Pattern',
                auto: 'auto',                       // do not change
                line: 'Line',                       // do not change
                rectilinear: 'Rectilinear',         // do not change
                rectilinearGrid: 'Rectilinear Grid',// do not change
                honeycomb: 'Honeycomb',             // do not change
                offset: 'Offset',
                xyOffset: 'Horizontal Expansion',
                zOffset: 'Z Offset',
                cutBottom: 'Cut Bottom',
                curaInfill: {
                    automatic: 'Automatic',
                    grid: 'Grid',
                    lines: 'Lines',
                    concentric: 'Concentric',
                    concentric_3d: 'Concentric 3D',
                    cubic: 'Cubic',
                    cubicsubdiv: 'Cubic Subdivison',
                    tetrahedral: 'Tetrahedral',
                    triangles: 'Triangles',
                    zigzag: 'Zigzag'
                },
                curaSupport: {
                    lines: 'Lines',
                    grid: 'Grid',
                    zigzag: 'Zigzag'
                },
                blackMagic: 'Black Magic',
                spiral: 'Spiral',
                generalSupport: 'General Support',
                spacing: 'Line Distance',
                overhang: 'Overhang',
                zDistance: 'Z Distance',
                raft: 'Raft',
                raftLayers: 'Raft Layers',
                brim: 'Brim Width',
                skirts: 'Skirts',
                movement: 'Movement',
                structure: 'Structure',
                traveling: 'Traveling',
                surface: 'Surface',
                firstLayer: 'First Layer',
                solidLayers: 'Solid Layers',
                innerShell: 'Inner Shell',
                outerShell: 'Outer Shell',
                bridge: 'Bridge',
                config: 'Expert Settings',
                presets: 'Configs',
                name: 'Name',
                apply: 'APPLY',
                save: 'SAVE',
                saveAsPreset: 'Save Config',
                cancel: 'CANCEL',
                delete: 'DELETE',
                loadPreset: 'Load Config',
                savePreset: 'Save Config',
                reloadPreset: 'Reset Config',
                printing: 'Printing',
                firstLayerTemperature: 'First Layer',
                flexibleMaterial: 'Flexible Material'
            },
            mode: [
                {
                    value: 'beginner',
                    label: 'Beginner',
                    checked: true
                },
                {
                    value: 'expert',
                    label: 'Expert'
                }
            ],
            params: {
                beginner: {
                    print_speed: {
                        text: 'Print Speed',
                        options: [
                            {
                                value: 'slow',
                                label: 'Slow',
                                selected: true
                            },
                            {
                                value: 'fast',
                                label: 'Fast'
                            }
                        ]
                    },
                    material: {
                        text: 'Material',
                        options: [
                            {
                                value: 'pla',
                                label: 'PLA',
                                selected: true
                            }
                        ]
                    },
                    support: {
                        text: 'Support',
                        on: 'On',
                        off: 'Off',
                        options: [
                            {
                                value: 'Touching',
                                label: 'Touching',
                                checked: true
                            },
                            {
                                value: 'nowhere',
                                label: 'nowhere'
                            }
                        ]
                    },
                    platform: {
                        text: 'Platform',
                        options: [
                            {
                                value: 'raft',
                                label: 'Raft',
                                checked: true
                            }
                        ]
                    }
                },
                expert: {
                    layer_height: {
                        text: 'Layer Height',
                        value: 0.3,
                        unit: 'mm'
                    },
                    print_speed: {
                        text: 'Print Speed',
                        value: 50,
                        unit: 'mm/s'
                    },
                    temperature: {
                        text: 'Temperature',
                        value: 231,
                        unit: '°C'
                    },
                    support: {
                        text: 'Support',
                        options: [
                            {
                                value: 'everywhere',
                                label: 'Everywhere',
                                checked: true
                            },
                            {
                                value: 'nowhere',
                                label: 'nowhere'
                            }
                        ]
                    },
                    platform: {
                        text: 'Platform',
                        options: [
                            {
                                value: 'raft',
                                label: 'Raft',
                                checked: true
                            }
                        ]
                    }
                }
            },
            left_panel: {
                raft_on: 'RAFT ON',
                raft_off: 'RAFT OFF',
                support_on: 'SUPPORT ON',
                support_off: 'SUPPORT OFF',
                advanced: 'ADVANCED',
                preview: 'PREVIEW',
                plaTitle: 'PICK THE COLOR OF THE FILAMENT',
                transparent: 'TRANSPARENT',
                raftTitle: 'Raft are layers built under your parts and help them stick to the base plate',
                supportTitle: 'Support are generated structures to supportt overhanging parts of your object, in order to prevent filament dropping',
                advancedTitle: 'Detail 3d printing parameters, you may acheive better result than default by adjusting them',
                confirmExitFcodeMode: 'Exiting preview mode will unload the FCode, are you sure?'
            },
            right_panel: {
                get: 'Get',
                go: 'Go',
                preview: 'Preview'
            },
            quality: {
                high: 'HIGH QUALITY',
                med: 'MEDIUM QUALITY',
                low: 'LOW QUALITY',
                custom: 'CUSTOM QUALITY'
            },
            model: {
                fd1: 'DELTA',
                fd1p: 'DELTA+'
            },
            scale: 'SCALE',
            rotate: 'ROTATE',
            delete: 'Delete',
            reset: 'Reset',
            cancel: 'CANCEL',
            done: 'DONE',
            pause: 'PAUSE',
            restart: 'RESTART',
            download_prompt: 'please enter file name',
            importTitle: 'Import 3D models ( .stl )',
            getFcodeTitle: 'Save toolhead path and config into FCode file ( *.fc )',
            goTitle: 'Prepare to print',
            deviceTitle: 'Show machine monitor',
            rendering: 'Slicing',
            reRendering: 'Re-Slicing',
            finishingUp: 'Finishing up...',
            savingFilePreview: 'Saving file preview',
            uploading: 'Uploading to slicing engine',
            uploaded: 'Uploaded, slicing engine is processing...',
            importingModel: 'Importing Model',
            wait: 'Please wait...',
            out_of_range: 'Out of range',
            out_of_range_message: 'please reduce the size of the object(s)',
            drawingPreview: 'Drawing preview path, please wait',
            gettingSlicingReport: 'Getting slicing status'
        },
        draw: {
            pen_up: 'Moving Height',
            pen_down: 'Drawing Height',
            speed: 'Speed',
            pen_up_title: 'The height that your pen won\'t contact drawing surface',
            pen_down_title: 'The height that your pen will contact drawing surface, must be lower than moving height',
            speed_title: 'The drawing speed',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
        },
        cut: {
            horizontal_calibrate: 'Horizontal\nAdjustment',
            height_calibrate: 'Height\nAdjustment',
            running_horizontal_adjustment: 'Running Horizontal Adjustment..',
            running_height_adjustment: 'Running Height Adjustment...',
            run_height_adjustment: 'Please adjust the blade, and run the height adjustment',
            horizontal_adjustment_completed: 'Horizontal Adjustment Completed',
            height_adjustment_completed: 'Height Adjustment Completed',
            you_can_now_cut: 'Congrats! You can now start cutting sheets.',
            zOffset: 'Height Offset',
            overcut: 'Overcut',
            speed: 'Speed',
            bladeRadius: 'Blade Radius',
            backlash: 'Backlash Compensation',
            zOffsetTip: 'Adjust the cutting height for thicker vinyl or to prevent cutting too hard or too light',
            overcutTip: 'Overcut loops for peeling off easier',
            speedTip: 'The cutting speed',
            backlashTip: 'Adjust the value if straight lines are not straight enough when using third party blade.',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
        },
        mill: {
            calibrate: 'Auto\nLevel',
            zOffset: 'Cutting Height',
            overcut: 'Overcut',
            speed: 'Speed',
            repeat: 'Repeat',
            stepHeight: 'Step Height',
            backlash: 'Backlash Compensation',
            zOffsetTip: 'Adjust cutting height for thicker vinyl and to prevent cutting too hard or too light',
            overcutTip: 'Overcut loops for peeling off easier',
            speedTip: 'The cutting speed',
            backlashTip: 'Adjust the value if straight lines is not straight enough',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
        },
        laser: {
            import: 'IMPORT',
            save: 'Save',
            custom: 'Custom',
            presets: 'Load Config',
            button_advanced: 'ADVANCED',
            confirm: 'Confirm',
            get_fcode: 'Save<br/>Task',
            export_fcode: 'Save as File ...',
            name: 'Name',
            go: 'GO',
            showOutline: 'View\nFrame',
            do_calibrate: 'It seems you\'re using engraving for the first time, you can use the kraft card in the package to find the best focal length. Do you wish to load the calibration image? You can also load it later in "Advanced".',
            process_caption: 'Generating',
            laser_accepted_images: 'Supported formats: BMP/GIF/JPG/PNG/SVG',
            draw_accepted_images: 'Supported formats: SVG',
            svg_fail_messages: {
                'TEXT_TAG': 'SVG Tag &lt;text&gt; is not supported',
                'DEFS_TAG': 'SVG Tag &lt;defs&gt; is not supported',
                'CLIP_TAG': 'SVG Tag &lt;clip&gt; is not supported',
                'FILTER_TAG': 'SVG Tag &lt;filter&gt; is not supported',
                'EMPTY': 'is an empty file',
                'FAIL_PARSING': 'failed on parsing process',
                'SVG_BROKEN': 'was broken',
                'NOT_SUPPORT': 'This file is not SVG'
            },
            title: {
                material: 'Select a proper material to have the best engraving result.',
                object_height: 'Object height measured from the base plate to the max height of the object',
                height_offset: 'Adjust z position for best laser focusing',
                shading: 'Shading enables the gradient effect of laser engraving. It takes longer time.',
                advanced: 'Custom settings for power and speed.'
            },
            print_params: {
                object_height: {
                    text: 'OBJECT HEIGHT',
                    unit: 'mm'
                },
                height_offset: {
                    text: 'FOCUS OFFSET',
                    unit: 'mm'
                },
                shading: {
                    text: 'SHADING',
                    textOn: 'ON',
                    textOff: 'OFF',
                    checked: true
                }
            },
            object_params: {
                position: {
                    text: 'POSITION'
                },
                size: {
                    text: 'SIZE',
                    unit: {
                        width: 'W',
                        height: 'H'
                    }
                },
                rotate: {
                    text: 'ROTATE'
                },
                threshold: {
                    text: 'THRESHOLD',
                    default: 128
                }
            },
            advanced: {
                label: 'Setup',
                form: {
                    object_options: {
                        text: 'MATERIAL',
                        label: 'Object Options',
                        options: [
                            {
                                value: 'cardboard',
                                label: 'Kraftpaper',
                                data: {
                                    laser_speed: 10,
                                    power: 255
                                }
                            },
                            {
                                value: 'wood',
                                label: 'WOOD',
                                data: {
                                    laser_speed: 3,
                                    power: 255
                                }
                            },
                            {
                                value: 'leather',
                                label: 'LEATHER',
                                data: {
                                    laser_speed: 5,
                                    power: 255
                                }
                            },
                            {
                                value: 'paper',
                                label: 'PAPER',
                                data: {
                                    laser_speed: 2,
                                    power: 255
                                }
                            },
                            {
                                value: 'cork',
                                label: 'CORK',
                                data: {
                                    laser_speed: 5,
                                    power: 255
                                }
                            },
                            {
                                value: 'other',
                                label: 'OTHER',
                                data: {}
                            }
                        ]
                    },
                    laser_speed: {
                        text: 'Laser Speed',
                        unit: 'mm/s',
                        fast: 'Fast',
                        slow: 'Slow',
                        min: 0.8,
                        max: 20,
                        step: 0.1
                    },
                    power: {
                        text: 'Power',
                        high: 'High',
                        low: 'Low',
                        min: 0,
                        max: 255,
                        step: 1
                    }
                },
                save_and_apply: 'SAVE & APPLY',
                save_as_preset: 'SAVE',
                save_as_preset_title: 'Save Config',
                load_preset_title: 'Load Config',
                background: 'Background',
                removeBackground: ' Remove Background',
                removePreset: 'selected preset is going to be revomved',
                load_calibrate_image: 'Load Calibration Image',
                apply: 'APPLY',
                cancel: 'CANCEL',
                save: 'SAVE'
            }
        },
        scan: {
            stop_scan: 'Stop',
            over_quota: 'Over quota',
            convert_to_stl: 'Convert',
            scan_again: 'Scan Again',
            start_multiscan: 'Extra Scan',
            processing: 'Processing...',
            remaining_time: 'Left',
            do_save: 'Save STL',
            go: 'Go',
            rollback: 'Back',
            error: 'Error',
            confirm: 'Confirm',
            caution: 'Caution',
            cancel: 'Cancel',
            delete_mesh: 'Delete?',
            quality: 'QUALITY',
            scan_again_confirm: 'Do you wish to discard current scan result?',
            calibrate: 'Calibrate',
            calibration_done: {
                caption: 'Calibration Done',
                message: 'You are able to scan now'
            },
            cant_undo: 'Unable to undo',
            estimating: 'Estimating the time...',
            calibrate_fail: 'Calibration Failed',
            calibration_is_running: 'Calibrating for Scanning',
            calibration_firmware_requirement: 'Please upgrade your firmware to 1.6.9+',
            resolution: [{
                id: 'best',
                text: 'Best',
                time: '~30min',
                value: 1200
            },
            {
                id: 'high',
                text: 'High',
                time: '~20min',
                value: 800
            },
            {
                id: 'normal',
                text: 'Normal',
                time: '~10min',
                value: 400
            },
            {
                id: 'low',
                text: 'Low',
                time: '~5min',
                value: 200
            },
            {
                id: 'draft',
                text: 'Draft',
                time: '~2min',
                value: 100
            }],
            save_mode: [
                {
                    value: 'stl',
                    label: 'STL',
                    checked: true
                },
                {
                    value: 'pcd',
                    label: 'PCD'
                },
            ],
            manipulation: {
                filter: 'FILTER',
                position: 'POSITION',
                size: 'SIZE',
                rotate: 'ROTATE',
                crop: 'Crop',
                manual_merge: 'Merge',
                clear_noise: 'Denoise',
                save_pointcloud: 'Export'
            },
            size: {
                x: 'X',
                y: 'Y',
                z: 'Z'
            },
            rotate: {
                x: 'X',
                y: 'Y',
                z: 'Z'
            },
            translate: {
                x: 'X',
                y: 'Y',
                z: 'Z'
            },
            messages: {
                'not open': {
                    caption: 'Camera not detected / Too dark',
                    message: 'Please pull off the scanning camera, until it makes a sound at the end.'
                },
                'no object': {
                    caption: 'Calibration tool not detected',
                    message: 'Insert the calibration tool into the center slot, and make sure there is sufficient lighting.'
                },
                'no laser': {
                    caption: 'Scanning laser not detected',
                    message: 'Press the laser heads to open it, and make sure the lighting is not to much.'
                }
            }
        },
        beambox: {
            toolbox: {
                ALIGN_LEFT: 'Align Left',
                ALIGN_RIGHT: 'Align Right',
                ALIGN_TOP: 'Align Top',
                ALIGN_BOTTOM: 'Align Bottom',
                ALIGN_CENTER: 'Align Center',
                ALIGN_MIDDLE: 'Align Middle',
                ARRANGE_HORIZON: 'Arrange Horizontally',
                ARRANGE_VERTICAL: 'Arrange Vertically',
                ARRANGE_DIAGONAL: 'Arrange Diagonally'
            },
            popup: {
                select_favor_input_device: 'Better user experience has been optimized<br/>Please select your favorite input device.',
                select_import_method: 'Select layering style:',
                touchpad: 'TouchPad',
                mouse: 'Mouse',
                layer_by_layer: 'Layer',
                layer_by_color: 'Color',
                nolayer: 'Single Layer',
                no_support_text: 'FLUX Studio does not support text tag currently. Please transfer text to path before importing.',
                power_too_high_damage_laser_tube: 'Using lower laser power will extends laser tube\'s lifetime.' ,
                speed_too_high_lower_the_quality: 'Using too high speed at this resolution may result in the lower quality of shading engraving.',
                both_power_and_speed_too_high: 'Using lower laser power will extends laser tube\'s lifetime.\nAlso, too high speed at this resolution may result in the lower quality of shading engraving.',
                should_update_firmware_to_continue: 'Your firmware does not support some improvements of FLUX Studio. For better performance and user experience, please update firmware to continue. (Menu > Machine > [Your Machine] > Update Firmware)'
            },
            left_panel: {
                insert_object: 'Insert Object',
                preview: 'Preview',
                advanced: 'Advanced',
                image_trace: 'Image Trace',
                suggest_calibrate_camera_first: 'Please calibrate the camera. (Menu > Machine > [Your Machine] > Calibrate Camera)\nRefocus platform properly everytime using it to perform better preview result.',
                end_preview: 'End Preview Mode',
                unpreviewable_area: 'The area is not allowed to preview',
                rectangle: 'Rectangle',
                ellipse: 'Ellipse',
                line: 'Line',
                image: 'Image',
                text: 'Text',
                insert_object_submenu: {
                    rectangle: 'Rectangle',
                    ellipse: 'Ellipse',
                    line: 'Line',
                    image: 'Image',
                    text: 'Text',
                    path: 'Path',
                    polygon: 'Polygon'
                },
                advanced_panel: {
                    engrave_parameters: 'Engraving Parameters',
                    rotary_mode: 'Rotary',
                    engrave_dpi: 'Resolution',
                    low: 'Low',
                    medium: 'Medium',
                    high: 'High',
                    cancel: 'Cancel',
                    save: 'Save'
                }
            },
            right_panel: {
                layer_panel: {
                    layer1: 'Layer 1',
                    layer_bitmap: 'Bitmap'
                },
                laser_panel: {
                    parameters: 'Parameters',
                    strength: 'Power',
                    speed: 'Speed',
                    repeat: 'Execute',
                    times: 'times',
                    cut: 'Cut',
                    engrave: 'Engrave',
                    more: 'More',
                    delete: 'DELETE',
                    apply: 'APPLY',
                    cancel: 'CANCEL',
                    save: 'SAVE',
                    name: 'Name',
                    dropdown: {
                        wood_3mm_cutting: 'Wood - 3mm Cutting',
                        wood_5mm_cutting: 'Wood - 5mm Cutting',
                        wood_bw_engraving: 'Wood - BW Engraving',
                        wood_shading_engraving: 'Wood - Shading Engraving',
                        acrylic_3mm_cutting: 'Acrylic - 3mm Cutting',
                        acrylic_5mm_cutting: 'Acrylic - 5mm Cutting',
                        acrylic_bw_engraving: 'Acrylic - BW Engraving',
                        acrylic_shading_engraving: 'Acrylic - Shading Engraving',
                        leather_3mm_cutting: 'Leather - 3mm Cutting',
                        leather_5mm_cutting: 'Leather - 5mm Cutting',
                        leather_bw_engraving: 'Leather - BW Engraving',
                        leather_shading_engraving: 'Leather - Shading Engraving',
                        fabric_3mm_cutting: 'Fabric - 3mm Cutting',
                        fabric_5mm_cutting: 'Fabric - 5mm Cutting',
                        fabric_bw_engraving: 'Fabric - BW Engraving',
                        fabric_shading_engraving: 'Fabric - Shading Engraving',
                        save: 'Save',
                        more: 'More...',
                        parameters: 'Parameters...'
                    },
                    laser_speed: {
                        text: 'Laser Speed',
                        unit: 'mm/s',
                        fast: 'Fast',
                        slow: 'Slow',
                        min: 3,
                        max: 300,
                        step: 0.1
                    },
                    power: {
                        text: 'Power',
                        high: 'High',
                        low: 'Low',
                        min: 1,
                        max: 100,
                        step: 0.1
                    }
                },
            },
            bottom_right_panel: {
                convert_text_to_path_before_export: 'Convert Text to Path...'
            },
            image_trace_panel: {
                apply: 'Apply',
                back: 'Back',
                cancel: 'Cancel',
                next: 'Next',
                brightness: 'Brightness',
                contrast: 'Contrast',
                threshold: 'Threshold',
                okay: 'Okay',
                tuning: 'Parameters'
            },
            object_panels: {
                position: 'Position',
                rotation: 'Rotation',
                size: 'Size',
                width: 'Width',
                height: 'Height',
                center: 'Center',
                ellipse_radius: 'Size',
                rounded_corner: 'Rounded Corner',
                radius: 'Radius',
                points: 'Points',
                text: 'Text',
                font_size: 'Size',
                fill: 'Fill',
                letter_spacing: 'Letter Spacing',
                convert_to_path: 'Convert to Path',
                convert_to_path_to_get_precise_result: 'Some fonts can\'t be parsed correctly. Please convert text to path before submitting to Beambox',
                wait_for_parsing_font: 'Parsing font... Please wait a second',
                laser_config: 'Laser Config',
                shading: 'Shading',
                threshold: 'Threshold',
                lock_desc: 'Preserve the ratio of width and height (SHIFT)'
            },
            tool_panels:{
                cancel: 'Cancel',
                confirm: 'Confirm',
                grid_array: 'Create Grid Array',
                array_dimension: 'Array Dimension',
                rows: 'Rows',
                columns: 'Cols.',
                array_interval: 'Array Interval',
                dx: 'X',
                dy: 'Y',

            },
            svg_editor: {
                unnsupported_file_type: 'The file type is not directly supported. Please convert the file into SVG or bitmap',
                unnsupport_ai_file_directly: 'Please convert your AI file into SVG or Bitmap first.'
            },
            units: {
                walt: 'W',
                mm: 'mm'
            }
        },
        select_printer: {
            choose_printer: 'Choose a machine',
            notification: '"%s" requires a password',
            submit: 'SUBMIT',
            please_enter_password: 'Password',
            auth_failure: 'Authentication fail',
            retry: 'Retry',
            unable_to_connect: '#008 Unable to build a stable connection with machine'
        },
        device: {
            pause: 'Pause',
            paused: 'Paused',
            pausing: 'Pausing',
            select_printer: 'Select Printer',
            retry: 'Retry',
            status: 'Status',
            busy: 'Busy',
            ready: 'Ready',
            reset: 'Reset (Kick)',
            abort: 'Abort',
            start: 'Start',
            please_wait: 'Please Wait...',
            quit: 'Quit',
            heating: 'Heating',
            completing: 'Completing',
            aborted: 'Aborted',
            completed: 'Completed',
            calibrating: 'Calibrating',
            showOutline: 'frame showing',
            aborting: 'Aborting',
            starting: 'Starting',
            resuming: 'Resuming',
            scanning: 'Scanning',
            occupied: 'Mantaining',
            running: 'Working',
            uploading: 'Uploading',
            processing: 'Processing',
            disconnectedError: {
                caption: 'Machine disconnected',
                message: 'Please confirm if network access of %s is available'
            },
            noTask: 'There are currently no task to do',
            pleaseWait: 'Please Wait...',
            finishing: 'Finishing',
            initiating: 'Initiating',
            unknown: 'Unknown',
            pausedFromError: 'Paused from error',
            model_name: 'Model Name',
            IP: 'IP',
            serial_number: 'Serial Number',
            firmware_version: 'Firmware Version',
            UUID: 'UUID',
            select: 'Select',
            deviceList: 'Machine List',
            calibration: {
                title: 'Auto Calibration',
                A: 'Leveling & Height',
                H: 'Height Only',
                N: 'Off',
                byFile: 'By File'
            },
            detectFilament: {
                title: 'Filament Detection',
                on: 'On',
                off: 'Off',
                byFile: 'By File'
            },
            filterHeadError: {
                title: 'Toolhead Error Detection',
                shake: 'Shake',
                tilt: 'Tilt',
                fan_failure: 'Fan Failure',
                laser_down: 'Laser Interlock',
                byFile: 'By File',
                no: 'No'
            },
            autoresume: {
                title: 'Smart Task Continuation',
                on: 'On',
                off: 'Off'
            },
            broadcast: {
                title: 'UPNP Broadcast',
                L: 'Default',
                A: 'Active',
                N: 'No'
            },
            enableCloud: {
                title: 'Enable Cloud',
                A: 'Active',
                N: 'No'
            },
            backlash: 'Geometric Error Correction',
            turn_on_head_temperature: 'Set Toolhead Temperature',
            plus_camera: 'Upgrade Kits Camera',
            plus_extrusion: 'Upgrade Kits Extruder',
            postback_url: 'Status callback URL',
            movement_test: 'Movement Test Before Print',
            machine_radius: 'Delta Radius',
            disable: 'Disable',
            enable: 'Enable',
            beambox_should_use_touch_panel_to_adjust: 'Beambox settings should be adjusted from Beambox touch panel.'
        },
        monitor: {
            change_filament                     : 'CHANGE FILAMENT',
            browse_file                         : 'BROWSE FILE',
            monitor                             : 'MONITOR',
            currentTemperature                  : 'Current Temp',
            nothingToPrint                      : 'There is nothing to print',
            go                                  : 'Start',
            start                               : 'Start',
            pause                               : 'Pause',
            stop                                : 'Stop',
            record                              : 'Record',
            camera                              : 'Camera',
            connecting                          : 'Connecting, please wait...',
            HEAD_OFFLINE                        : '#110 Toolhead not detected\nMake sure the toolhead cable is attached correctly <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218183157">More Info</a>',
            HEAD_ERROR_CALIBRATING              : '#112 Unable to calibrate toolhead\'s internal gyro\nPlease re-attach the toolhead',
            HEAD_ERROR_FAN_FAILURE              : '#113 Cooling fan failed\nKindly spin the fan with a pencil or thin stick. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/217732178">More Info</a>',
            HEAD_ERROR_HEAD_OFFLINE             : '#110 Toolhead not detected\nMake sure the toolhead cable is attached correctly <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218183157">More Info</a>',
            HEAD_ERROR_TYPE_ERROR               : '#111 Toolhead incorrect \nPlease attach the correct toolhead',
            HEAD_ERROR_INTLK_TRIG               : '#116 Engraving toolhead tilt detected \nPlease ensure the rods are connected correctly. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/217085937">More Info</a>',
            HEAD_ERROR_RESET                    : '#114 Toolhead bad connection\nMake sure the toolhead is connected correctly, kindly contact support if this error pops out twice in one print <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218183167">More Info</a>',
            HEAD_ERROR_TILT                     : '#162 Toolhead tilt detected\nPlease check ball joint rod is attached correctly',
            HEAD_ERROR_SHAKE                    : '#162 Toolhead tilt detected\nPlease check ball joint rod is attached correctly',
            HEAD_ERROR_HARDWARE_FAILURE         : '#164 Toolhead abnormal temperature detected\nPlease contact FLUX Support <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218415378">More Info</a>',
            'HEAD_ERROR_?'                      : '#199 Toolhead error \nCheck if the toolhead is abnormal',
            HARDWARE_ERROR_FILAMENT_RUNOUT      : '#121 Filament not detected \nPlease insert new material <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931757">More Info</a>',
            HARDWARE_ERROR_0                    : '#121 Filament not detected \nPlease insert new material <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931757">More Info</a>',
            HARDWARE_ERROR_PLATE_MISSING        : '#122 Unable to detect the base plate\nPlease put on the plate.',
            HARDWARE_ERROR_ZPROBE_ERROR         : '#123 Unable to calibrate the base plate\nPlease remove potential obstacles (left-over on the nozzle or the plate ) <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931767">More Info</a>',
            HARDWARE_ERROR_CONVERGENCE_FAILED   : '#123 Unable to calibrate the base plate\nPlease remove potential obstacles (left-over on the nozzle or the plate ) <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931767">More Info</a>',
            HARDWARE_ERROR_HOME_FAILED          : '#124 Unable to calibrate origin (home)\nPlease remove obstacles on rails, and make sure toolhead cables are not caught by carriages.',
            HARDWARE_ERROR_MAINBOARD_ERROR      : '#401 Critical Error: Mainboard offline. Please contact FLUX Support.',
            HARDWARE_ERROR_SUBSYSTEM_ERROR      : '#402 Critical Error: Subsystem no response. Please contact FLUX Support.',
            HARDWARE_ERROR_SENSOR_ERROR         : 'Hardware sensor error, please contact FLUX Support.~',
            HARDWARE_ERROR_SENSOR_ERROR_FSR     : 'Pressure sensor failed',
            HARDWARE_ERROR_PUMP_ERROR           : '#900 Please check with your water tank.',
            HARDWARE_ERROR_DOOR_OPENED          : '#901 Close the door to continue.',
            HARDWARE_ERROR_OVER_TEMPERATURE     : '#902 Overheated. Please wait for a few minutes.',
            USER_OPERATION_ROTARY_PAUSE         : 'Please switch to the rotary motor',
            WRONG_HEAD                          : 'Toolhead is unknown, please connect to a correct toolhead',
            USER_OPERATION                      : 'Machine is being operated by (other) user',
            RESOURCE_BUSY                       : 'The machine is busy\nIf it is not running, please restart the machine',
            DEVICE_ERROR                        : 'Something went wrong\nPlease restart the machine',
            NO_RESPONSE                         : 'Something went wrong\nPlease restart the machine',
            SUBSYSTEM_ERROR                     : '#402 Critical Error: Subsystem no response. Please contact FLUX Support.',
            HARDWARE_FAILURE                    : 'Something went wrong\nPlease restart the machine',
            MAINBOARD_OFFLINE                   : 'Something went wrong\nPlease restart the machine',
            G28_FAILED                          : '#124 Unable to calibrate origin (home)\nPlease remove obstacles on rails, and make sure toolhead cables are not caught by carriages.',
            FILAMENT_RUNOUT_0                   : '#121 Ran out of filament\nPlease insert new material <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931757">More Info</a>',
            USER_OPERATION_FROM_CODE            : 'Paused for operation (filament change)',
            processing                          : 'Processing',
            savingPreview                       : 'Generating thumbnails',
            hour                                : 'h',
            minute                              : 'm',
            second                              : 's',
            left                                : 'left',
            temperature                         : 'Temperature',
            forceStop                           : 'Do you wish to abort current task?',
            upload                              : 'Upload',
            download                            : 'Download',
            fileNotDownloadable                 : 'This file type is not supported for download',
            cannotPreview                       : 'Can not preview this file format',
            extensionNotSupported               : 'This file format is not supported',
            fileExistContinue                   : 'File already exists, do you want to replace it?',
            confirmGToF                         : 'The GCode will be converted to FCode, do you want to continue? ( will replace if exists )',
            updatePrintPresetSetting            : 'FLUX Studio has new default printing parameters, do you want to update?\n( Current settings will be overwritten )',
            confirmFileDelete                   : 'Are you sure you want to delete this file?',
            task: {
                EXTRUDER                        : 'Printing',
                PRINT                           : 'Printing',
                LASER                           : 'Laser Engraving',
                DRAW                            : 'Digital Drawing',
                CUT                             : 'Vinyl Cutting',
                VINYL                           : 'Vinyl Cutting',
                BEAMBOX                         : 'Laser Engraving',
                'N/A'                           : 'Free Mode'
            },
            device: {
                EXTRUDER                        : 'Printing Toolhead',
                LASER                           : 'Engraving Toolhead',
                DRAW                            : 'Drawing Toolhead'
            },
            cant_get_toolhead_version           : 'Unable to get toolhead information'
        },
        alert: {
            caption: 'Error',
            duplicated_preset_name: 'Duplicated preset name',
            info: 'INFO',
            warning: 'WARNING',
            error: 'UH-OH',
            retry: 'RETRY',
            abort: 'ABORT',
            cancel: 'CANCEL',
            close: 'CLOSE',
            ok: 'OK',
            yes: 'YES',
            no: 'NO',
            stop: 'Stop'
        },
        caption: {
            connectionTimeout: 'Connection timeout'
        },
        message: {
            connecting: 'Connecting...',
            connectingMachine: 'Connecting %s...',
            tryingToConenctMachine: 'Trying to connect to machine...',
            connected: 'Connected',
            authenticating: 'Authenticating...',
            runningTests: 'Running tests...',
            machineNotConnected: 'Machine is not connected',
            notPrinting: 'Printing is not in progress',
            nothingToPrint: 'Nothing to print (source blob missing)',
            connectionTimeout: 'Please check your network state and your machine\'s Wi-Fi indicator.',
            device_not_found: {
                caption: 'Default Machine not found',
                message: 'Please check your machine\'s Wi-Fi indicator'
            },
            device_busy: {
                caption: 'Machine Busy',
                message: 'The machine is executing another task, try again later. If it stops working, please restart the machine.'
            },
            device_is_used: 'The machine is being used, do you want to abort current task?',
            device_in_use: 'The machine is being used, please stop or pause current task.',
            invalidFile: 'The file is not a valid STL file',
            failGeneratingPreview: 'Fail to generate preview',
            slicingFailed: 'slic3r is unable to slice this model',
            no_password: {
                content: 'Setup machine password via USB to enable connection for this computer',
                caption: 'Password not set'
            },
            image_is_too_small: 'The file contains unsupported information',
            monitor_too_old: {
                caption: 'Firmware Outdated',
                content: 'Please install the latest firmware with <a target="_blank" href="http://helpcenter.flux3dp.com/hc/en-us/articles/216251077">this guide</a>.'
            },
            cant_establish_connection: 'Unable to connect FLUX Studio API. Please <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/requests/new" target="_blank">contact FLUX support.</a>',
            application_occurs_error: 'The application has encountered an unhandled error.',
            error_log: 'Error Log',
            fcodeForLaser: 'This is a FCode for engraving',
            fcodeForPen: 'This is a FCode for drawing',
            confirmFCodeImport: 'Importing FCode will remove all objects on the scene, are you sure?',
            confirmSceneImport: 'Importing .fsc will remove all objects on the scene, are you sure?',
            brokenFcode: 'Unable to open %s',
            slicingFatalError: 'Error encountered during slicing. Kindly report STL file to customer support.',
            unknown_error: 'The application has encountered an unknown error, please use Help > Menu > Bug Report.',
            unknown_device: 'Cannot connect to the machine, please make sure USB is attached to the machine',
            important_update: {
                caption: 'Important Update',
                message: 'Important Machine firmware update is available. Do you wish to update now?',
            },
            unsupport_osx_version: 'Unsupported Mac OS X Version Detected',
            need_password: 'Need Password to Connect to the Machine',
            new_app_downloading: 'FLUX Studio is Downloading',
            new_app_download_canceled: 'FLUX Studio download has been canceled',
            new_app_downloaded: 'Newest FLUX Studio has been downloaded',
            ask_for_upgrade: 'Do you wish to upgrade now?',
            please_enter_dpi: 'Please enter the DPI of your file',
            need_1_1_7_above: 'Please update firmware to v1.1.7+',
            gcode_area_too_big: 'Imported GCode exceed the printable area.',
            empty_file: 'File is empty',
            usb_unplugged: 'USB connection is lost. Please check your USB connection',
            launghing_from_installer_warning: 'You are launching FLUX Studio from the installer, and this may cause problems. Please move the FLUX Studio to the Application folder.',
            uploading_fcode: 'Uploading FCode',
            cant_connect_to_device: 'Unable to connect the machine, please check your connection',
            unable_to_find_machine: 'Unable to find machine ',
            unable_to_start: 'Unable to start the task. Please try again. If this happens again, please contact us with bug report:\n',
            camera_fail_to_transmit_image: 'Something went wrong with image transmission. Please try restarting your Beambox or contact us.'
        },
        machine_status: {
            '-10': 'Raw mode',
            '-2': 'Scanning',
            '-1': 'Maintaining',
            0: 'Idle',
            1: 'Initiating',
            2: 'ST_TRANSFORM',
            4: 'Starting',
            6: 'Resuming',
            16: 'Working',
            18: 'Resuming',
            32: 'Paused',
            36: 'Paused',
            38: 'Pausing',
            48: 'Paused',
            50: 'Pausing',
            64: 'Completed',
            66: 'Completing',
            128: 'Aborted',
            UNKNOWN: 'Unknown'
        },
        head_module: {
            EXTRUDER: 'Print',
            LASER: 'Laser',
            UNKNOWN: '',
            error: {
                'missing': 'Error information is missing',
                '0': 'Unknown module',
                '1': 'Sensor communication failure',
                '2': 'No hello', // pi will send head_error_reset before this is issued
                '3': '#112 Unable to calibrate toolhead\'s internal gyro\nPlease re-attach the toolhead',
                '4': '#162 Toolhead tilt detected\nPlease check ball joint rod is attached correctly',
                '5': '#162 Toolhead tilt detected\nPlease check ball joint rod is attached correctly',
                '6': '#119 Printer toolhead is unable to control temperature. Please contact FLUX Support.',
                '7': '#113 Cooling fan failed\nKindly spin the fan with a pencil or thin stick. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/217732178">More Info</a>',
                '8': '#116 Engraving toolhead tilt detected\nPlease ensure the rods are connected correctly. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/217085937">More Info</a>',
                '9': '#118 Unable to heat printer toolhead\nPlease contact FLUX Support.'
            }
        },
        change_filament: {
            home_caption: 'Change Filament',
            load_filament_caption: 'LOAD',
            load_flexible_filament_caption: 'LOAD FLEXIBLE',
            unload_filament_caption: 'UNLOAD',
            cancel: 'CANCEL',
            load_filament: 'Load Filament',
            load_flexible_filament: 'Load Flexible Filament',
            unload_filament: 'Unload Filament',
            next: 'NEXT',
            heating_nozzle: 'Heating nozzle',
            unloading: 'Unloading Filament',
            loaded: 'Filament Loaded',
            unloaded: 'Filament Unloaded',
            ok: 'OK',
            kicked: 'Has been kicked',
            auto_emerging: 'Please insert filament',
            loading_filament: 'Loading filament',
            maintain_head_type_error: 'Toolhead not installed correctly',
            disconnected: 'Connection unstable, Please check device connection and try again later',
            maintain_zombie: 'Please restart the machine',
            toolhead_no_response: '#117 Module no response <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218347477">More</a>',
            NA: 'Toolhead is not connected'
        },
        head_temperature: {
            title: 'Set toolhead temperature',
            done: 'FINISH',
            target_temperature: 'Target temperature',
            current_temperature: 'Current temperature',
            set: 'set',
            incorrect_toolhead: 'Incorrect toolhead, please use printing toolhead',
            attach_toolhead: 'Please connect the printing toolhead'
        },
        camera_calibration: {
            camera_calibration: 'Camera Calibration',
            next: 'NEXT',
            cancel: 'CANCEL',
            back: 'BACK',
            finish: 'DONE',
            please_goto_beambox_first: 'Please switch to Engraving Mode ( Beambox ) in order to use this feature.',
            please_place_paper: {
                beambox: 'Please place an A4 or Letter size white paper at left-top corner of workarea',
                beamo: 'Please place an A4 or Letter size white paper at left-top corner of workarea',
            },
            please_refocus: {
                beambox: 'Kindly adjust the platform to the focal point (the height of turned down acrylic)',
                beamo: 'Kindly adjust the laser head to focus on the engraving object (the height of turned down acrylic)'
            },
            taking_picture: 'Taking Picture...',
            start_engrave: 'START ENGRAVE',
            analyze_result_fail: 'Fail to analyze captured image.<br/>Please make sure:<br/>1. Captured picture fully coverd with white paper.<br/>2. The platform is focus properly.',
            no_lines_detected: 'Fail to detect lines from captured image.<br/>Please make sure:<br/>1. Captured picture fully coverd with white paper.<br/>2. The platform is focus properly.',
            drawing_calibration_image: 'Drawing calibration image...',
            please_confirm_image: '<div><div class="img-center" style="background:url(%s)"></div></div>Please make sure:<br/>1. Captured picture fully coverd with white paper.<br/>2. The platform is focus properly.',
            calibrate_done: 'Calibration done. Better camera accurency is given when focus precisely.'
        },
        input_machine_password: {
            require_password: '"%s" requires a password',
            connect: 'CONNECT',
            password: 'Password'
        },
        set_default: {
            success: 'Successfully set %s as default',
            error: 'Unable to set %s as default, due to network issue'
        },
        tutorial: {
            set_first_default_caption: 'Welcome',
            set_first_default: 'Do you wish to set "%s" as your default device?',
            startWithFilament: 'Now we\'re going to load the filament',
            startWithModel: 'Next, let\'s import an example 3D model',
            startTour: 'Welcome!<br/>This is your first time printing,<br/>would you like to start printing tutorial?',
            clickToImport: 'Click here to import an example 3D model',
            selectQuality: 'Select the quality you preferred',
            clickGo: 'Prepare to print',
            startPrint: 'Apply glue on the plate with no-grid, wait till it\' dry, then you are ready to print.',
            skip: 'Skip',
            startPrintDeltaPlus: 'Make sure you put on the magnetic print plate.',
            runningMovementTests: 'Running movement tests',
            connectingMachine: 'Connecting to the machine',
            movementTestFailed: { caption: 'Unable to pass movement tests',  message: '1. Make sure the toolhead cable is stretched correctly.<br/>2. Make sure the connector of toolhead cable to the machine has inserted about half into the machine.<br/>3. Try to turn the connector on the printing toolhead 180 degrees.<br/>4. Check <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/115003674128">this article</a>.<br/> Try again?' },
            befaultTutorialWelcome: 'Thank you for ordering FLUX Delta+!<br/><br/> This guide will help you take you through the basic settings of the machine and help you set up.<br/><br/> Let’s watch the tutorial! Please turn on the subtitles.<br/><br/>',
            openBrowser: 'openBrowser',
            welcome: 'WELCOME'
        },
        slicer: {
            computing: 'Computing',
            error: {
                '6': 'Calculated toolpath is out of working area. Please reduce the size of the object(s), or try to turn off raft, brim or skirt.',
                '7': 'Error occurred while setting advanced parameters.',
                '8': 'Slicing:: API returned empty result.\nRequest for result is probably called before slice complete',
                '9': 'Slicing:: API returned empty path.\nRequest for toolpath is probably called before slice complete',
                '10': 'Slicing:: Missing object data. The source object is missing from slicer engine',
                '13': 'Slicing:: Duplication error\nThe selected ID does not exist. If the error is not resolved by restarting FLUX Studio, please report this error.',
                '14': 'Slicing:: Error occurred while setting position. The source object is missing in slicer engine.',
                '15': 'Slicing:: Uploaded file is corrupt, please check the file and try again.',
                '16': 'Slicing:: Slicing engine exited abnormally, kindly slice again.',
                '1006': 'WS closed unexpectedly, please obtain the bug report from the help menu and sent it to us.'
            },
            pattern_not_supported_at_100_percent_infill: 'Slic3r only supports 100% infill with rectilinear infill pattern'
        },
        calibration: {
            RESOURCE_BUSY: 'Please make sure the machine is in idle status',
            headMissing: 'Cannot retrieve head module information, please make sure it\'s attached',
            calibrated: 'Auto Leveling Completed',
            extruderOnly: 'Please use the printing toolhead for calibration'
        },
        head_info: {
            ID                  : 'ID',
            VERSION             : 'Firmware Version',
            HEAD_MODULE         : 'Toolhead Type',
            EXTRUDER            : 'Printing Toolhead',
            LASER               : 'Engraving Toolhead',
            USED                : 'Used',
            HARDWARE_VERSION    : 'Hardware Version',
            FOCAL_LENGTH        : 'Focal Length',
            hours               : 'Hours',
            cannot_get_info     : 'Toolhead type is unreadable'
        }
    };
});
