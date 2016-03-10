define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - en'
        },
        support: {
            no_webgl: 'WebGL not supported. Please use other devices.'
        },
        device_selection: {
            no_printers: 'FLUX Device not detected. Please check if you and the FLUX device is under same network.',
            device_name: 'DEVICE NAME',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: 'Release Note:',
            firmware: {
                caption: 'An Firmware Update to FLUX is available',
                message_pattern_1: '"%s" is now ready for firmware update.',
                message_pattern_2: 'FLUX Firmware v%s is now available - You have v%s.',
                latest_firmware: {
                    caption: 'Firmware Update',
                    message: 'You have the latest firmware'
                },
                confirm: 'UPLOAD',
                upload_file: 'Upload file',
                update_success: 'Firmware update successfully uploaded',
                update_fail: 'Update Fail'
            },
            software: {
                caption: 'An Software Update to FLUX is available',
                message_pattern_1: 'FLUX Studio is now ready for software update.',
                message_pattern_2: 'FLUX Software v%s is now available - You have v%s.'
            },
            toolhead: {
                caption: 'An Toolhead Firmware Update to FLUX is available',
                message_pattern_1: '"%s" is now ready for toolhead firmware update.',
                message_pattern_2: 'FLUX Toolhead Firmware %s is now available.',
                latest_firmware: {
                    caption: 'Firmware Update',
                    message: 'You have the latest firmware'
                },
                confirm: 'UPLOAD',
                upload_file: 'Upload file',
                update_success: 'Toolhead Firmware update successfully uploaded',
                update_fail: 'Update Fail'
            },
            network_unreachable: 'Network is unreachable',
            skip: 'Skip This Version',
            later: 'LATER',
            install: 'INSTALL',
            upload: 'UPLOAD'
        },
        topmenu: {
            version: 'Version',
            sure_to_quit: 'Sure to quit?',
            flux: {
                label: 'Flux',
                about: 'About FLUX studio',
                preferences: 'Preferences',
                quit: 'Quit'
            },
            file: {
                label: 'File',
                import: 'Import',
                save_gcode: 'Save Gcode',
                save_fcode: 'Save Task',
                save_scene: 'Save Scene'
            },
            edit: {
                label: 'Edit',
                duplicate: 'Duplicate',
                rotate: 'Rotate',
                scale: 'Scale',
                reset: 'Reset',
                clear: 'Clear Scene'
            },
            device: {
                label: 'Device',
                new: 'Add New Device',
                device_monitor: 'Device Monitor',
                change_filament: 'Change Filament',
                default_device: 'Set as default device',
                check_firmware_update: 'Check Firmware Update',
                update_toolhead: 'Update toolhead'
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
                troubleshooting: 'Troubleshooting',
                tutorial: 'Start Printing Tutorial',
                debug: 'Bug Report',
                forum: 'Community Forum'
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
            no_machine: 'I don\'t have a machine now',

            // specific caption/content
            invalid_device_name: 'The name can only contains chinese, alphabet, numbers, blanks, and special characters  “(”, “)”, “-”, “_”, “’”, “\'”.',
            require_device_name: 'Name is required',
            select_language: 'Select Language',
            change_password: {
                content: 'Are you sure to change the password?',
                caption: 'Changing password'
            },
            connect_flux: 'Connect FLUX Delta with USB Cable',
            name_your_flux: 'Name Your FLUX Delta',
            wifi_setup: 'Wi-Fi Setup',
            select_preferred_wifi: 'Select your preferred network.',
            requires_wifi_password: 'requires a password.',
            connecting: 'Connecting...',

            // page specific
            set_machine_generic: {
                printer_name: 'Name*',
                printer_name_placeholder: 'Give it an unique name',
                password: 'Password',
                set_station_mode: 'Set as wifi station',
                password_placeholder: 'Something secret'
            },

            setting_completed: {
                start: 'Start',
                is_ready: '“%s” is ready',
                station_ready_statement: 'Your FLUX Delta is now a Wi-Fi station, you can use your FLUX wirelessly by connect to Wi-Fi “%s”',
                brilliant: 'Brilliant!',
                begin_journey: 'You can now detach Micro USB Cable, and begin the journey with your FLUX Delta now.',
                great: 'Welcome to FLUX Studio',
                upload_via_usb: 'You can setup device Wi-Fi later. <br/>If you don\'t have Wi-Fi, check <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215998327-Connection-Guide-for-Desktop-PCs">Desktop Connection Guide</a>.',
                back: 'Back',
                ok: 'START CREATING'
            },

            // errors
            errors: {
                error: 'Error',

                keep_connect: {
                    caption: 'USB Device not found',
                    content: 'Oops! Don\'t worry. We\'re here for you.\nMake sure your FLUX Delta has been powered \non, attached to Micro USB Cable and the driver is installed.\n<a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215327328">...More solutions</a>'
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
                line1: 'Do you have available wifi could be able access?',
                line2: 'We are helping your FLUX to connecting to wifi',
                select: 'Yes',
                no_available_wifi: 'No, I haven\'t'
            },
            select: {
                choose_wifi: 'Please choose wifi what you wanna connect',
                no_wifi_available: 'There is no available wifi'
            },
            set_password: {
                line1: '請輸入「',
                line2: '」無線網路的連線密碼',
                password_placeholder: '請輸入 Wi-Fi 密碼',
                back: 'Back',
                join: 'Join',
                connecting: 'Connecting',
                no_selected: 'No SSID selected'
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
                notice: '設定密碼，可以確保你的 FLUX 只有知道密碼的人可以操作',
                next: '下一步'
            },
            setup_complete: {
                caption: 'We have completed all settings！',
                description: 'Lets start your first printing experience！',
                start: 'Start Using FLUX'
            },
            configuring_flux: {
                caption: 'We\'re configuring your FLUX as a wifi station',
                description: 'so you can control your FLUX through wifi network',
                next: 'next',
                footer: 'I want to swtich back to wifi connection'
            },
            configured_flux: {
                caption: 'Your FLUX is now a wifi station',
                description: 'you can start using it after few simple setting',
                next: 'next',
                footer: 'I want to swtich back to wifi connection'
            }
        },
        menu: {
            print: 'PRINT',
            laser: 'LASER',
            scan: 'SCAN',
            usb: 'USB',
            device: 'Device',
            setting: 'SETTING',
            draw: 'DRAW'
        },
        settings: {
            caption: 'Settings',
            tabs: {
                general: 'General',
                flux_cloud: 'FLUX Could',
                printer: 'Printer'
            },
            language: 'Language',
            notifications: 'Notifications',
            close: 'Close',
            printer: {
                new_printer: 'Add new printer',
                name: 'Printer Name',
                current_password: 'Current Password',
                set_password: 'Set Password',
                security_notice: 'You can protect your printer with password',
                connected_wi_fi: 'Connected Wi-Fi',
                advanced: 'Advanced',
                join_other_network: 'Join Other Network',
                disconnect_with_this_printer: 'Disconnect With This Printer',
                your_password: 'Your Password',
                confirm_password: 'Confirm Password',
                save_password: 'Save Password'
            },
            flux_cloud: {
                caption: 'Get FLUX 3D Printer be remote!',
                line1: 'Control your FLUX 3D Printer with FLUX Cloud in anywhere you are',
                start_to_use: 'Start to Use',
                i_have_an_account: 'I have an account',
                email: 'Email',
                password: 'Password',
                change_password: 'Change Password',
                connected_printer: 'Connected Printer',
                connect: 'Connect'
            },
            cancel: 'CANCEL',
            done: 'DONE',
            create_account: {
                create: 'Create new account',
                your_email: 'Your Email',
                password: 'Your Password',
                confirm_password: 'Confirm Password',
                signup: 'Sign Up',
                not_now: 'not now'
            },
            activate_info:  {
                almost_there: 'Almost there!',
                description: 'Go to your email inbox and activate your account',
                got_it: 'Got it'
            },
            connect_printer: {
                title: 'Connect with your printer'
            }
        },
        print: {
            import: 'IMPORT',
            go_home: 'Go Home',
            save: 'Save',
            normal_preview: 'Normal Preview',
            support_preview: 'Support Preview',
            start_print: 'Print',
            advanced: {
                general: 'General',
                layers: 'Layers',
                infill: 'Infill',
                support: 'Support',
                speed: 'Speed',
                custom: 'Expert',
                slicingEngine: 'Slicing Engine',
                slic3r: 'Slic3r',
                experiment: 'Experiment',
                filament: 'Filament',
                temperature: 'Temperature',
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
                line: 'line',                       // do not change
                rectilinear: 'rectilinear',         // do not change
                rectilinearGrid: 'rectilinear-grid',// do not change
                honeycomb: 'honeycomb',             // do not change
                blackMagic: 'Black Magic',
                spiral: 'Spiral',
                generalSupport: 'General Support',
                spacing: 'Spacing',
                overhang: 'Overhang',
                zDistance: 'Z Distance',
                support_pattern: 'Pattern',
                raft: 'Raft',
                raftLayers: 'Raft Layers',
                movement: 'Movement',
                structure: 'Structure',
                traveling: 'Traveling',
                surface: 'Surface',
                firstLayer: 'First Layer',
                solidLayers: 'Solid Layers',
                innerShell: 'Inner Shell',
                outerShell: 'Outer Shell',
                bridge: 'Bridge',
                config: 'Custom configuration',
                presets: 'Presets',
                name: 'Name',
                apply: 'APPLY',
                save: 'SAVE',
                saveAsPreset: 'Save Preset',
                cancel: 'CANCEL',
                saveAndApply: 'SAVE & APPLY',
                delete: 'DELETE',
                loadPreset: 'Load Preset',
                savePreset: 'Save Preset'
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
                qualityTitle: 'It will affect the outcome surface smoothness of your object. Better qualities need more time',
                raftTitle: 'A Raft are layers built under your part and help it stick to the base plate',
                supportTitle: 'A Support is a generated structure to support overhanging part of your object, to prevent filament dropping',
                previewTitle: 'Preview the actual path of toolhead during printing task',
                advancedTitle: 'Detail 3d printing parameters, you may acheive better result than default by adjusting them',
                confirmExitFcodeMode: 'Exiting preview mode will unload the fcode, are you sure?'
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
            quick_print: 'Quick Print',
            scale: 'SCALE',
            rotate: 'ROTATE',
            align_center: 'Align Center',
            delete: 'Delete',
            reset: 'Reset',
            cancel: 'CANCEL',
            done: 'DONE',
            gram: 'g',
            pause: 'PAUSE',
            continue: 'CONTINUE',
            restart: 'RESTART',
            download_prompt: 'please enter file name',
            importTitle: 'Import 3D models ( .stl )',
            getFcodeTitle: 'Save toolhead path and config into FCode file ( *.fc )',
            goTitle: 'Prepare to print',
            deviceTitle: 'Show device monitor',
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
        laser: {
            import: 'IMPORT',
            save: 'Save',
            custom: 'Custom',
            presets: 'Presets',
            acceptable_files: 'JPG, PNG, SVG',
            drop_files_to_import: 'Drop your file here or click "import" to upload your file',
            button_advanced: 'ADVANCED',
            confirm: 'Confirm',
            start_engrave: 'Engrave',
            start_cut: 'Cut',
            close_alert: 'Close',
            get_fcode: 'Save<br/>Task',
            name: 'Name',
            go: 'GO',
            process_caption: 'Generating',
            svg_fail_messages: {
                'TEXT_TAG': 'Tag &lt;text&gt; is not supported',
                'EMPTY': '%s is an empty file',
                'FAIL_PARSING': '%s is parsing fail',
                'SVG_BROKEN': '%s was broken'
            },
            title: {
                material: 'Select proper material to have the best engraving result.',
                object_height: 'A Raft are layers built under your part and help it stick to the base plate.',
                shading: 'Shading enables gradient effect of laser engraving. It takes longer time.',
                advanced: 'Custom settings for power and speed'
            },
            print_params: {
                object_height: {
                    text: 'OBJECT HEIGHT',
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
                                value: 'wood',
                                label: 'WOOD',
                                data: {
                                    laser_speed: 5,
                                    power: 255
                                }
                            },
                            {
                                value: 'leather',
                                label: 'LEATHER',
                                data: {
                                    laser_speed: 50,
                                    power: 255
                                }
                            },
                            {
                                value: 'paper',
                                label: 'PAPER',
                                data: {
                                    laser_speed: 10,
                                    power: 25
                                }
                            },
                            {
                                value: 'cork',
                                label: 'CORK',
                                data: {
                                    laser_speed: 15,
                                    power: 200
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
                        min: 0.1,
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
                save_as_preset_title: 'Save Preset',
                load_preset_title: 'Load Preset',
                apply: 'APPLY',
                cancel: 'CANCEL',
                save: 'SAVE'
            }
        },
        scan: {
            start_scan: 'Scan',
            stop_scan: 'Stop',
            over_quota: 'Over quota',
            convert_to_stl: 'Convert',
            scan_again: 'Scan Again',
            start_multiscan: 'Extra Scan',
            processing: 'Processing...',
            remaining_time: 'Left',
            elapsed_time: 'Elapsed Time',
            do_save: 'Save STL',
            go: 'Go',
            rollback: 'Back',
            error: 'Error',
            confirm: 'Confirm',
            caution: 'Caution',
            cancel: 'Cancel',
            delete_mesh: 'Delete?',
            quality: 'QUALITY',
            scan_again_confirm: 'Do you want to discard current scan result?',
            calibrate: 'Calibrate',
            calibration_done: {
                caption: 'Calibration Done',
                message: 'You can scan now'
            },
            estimating: 'estimating...',
            calibrate_fail: 'Calibration Failed',
            calibration_is_running: 'Calibrating for Scan',
            resolution: [{
                id: 'best',
                text: 'Best',
                time: '~60min',
                value: 1200
            },
            {
                id: 'high',
                text: 'High',
                time: '~40min',
                value: 800
            },
            {
                id: 'normal',
                text: 'Normal',
                time: '~20min',
                value: 400
            },
            {
                id: 'low',
                text: 'Low',
                time: '~10min',
                value: 200
            },
            {
                id: 'draft',
                text: 'Draft',
                time: '~5min',
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
                auto_merge: 'Loading filament',
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
                    caption: 'Camera not detect',
                    message: 'Please pull off the scanning camera, until it makes a sound at the end.'
                },
                'no object': {
                    caption: 'Calibration tool not detected',
                    message: 'Insert the calibration tool into the center slot.'
                },
                'no laser': {
                    caption: 'Laser not detected',
                    message: 'Press the laser heads to open it.'
                }
            }
        },
        select_printer: {
            choose_printer: 'Choose a printer',
            notification: 'Please enter the password',
            submit: 'SUBMIT',
            please_enter_password: 'password',
            auth_failure: 'Authentication fail',
            retry: 'Retry'
        },
        device: {
            camera_on: 'Open Camera',
            camera_off: 'Close Camera',
            browse_file: 'Browse Files',
            pause: 'Pause',
            paused: 'Paused',
            pausing: 'Pausing',
            cancelTask: 'Cancel Task',
            select_printer: 'Select Printer',
            retry: 'Retry',
            status: 'Status',
            busy: 'Busy',
            ready: 'Ready',
            reset: 'Reset (Kick)',
            abort: 'Abort',
            start: 'Start',
            no_task: 'There are currently no task to do',
            please_wait: 'Please Wait...',
            unknown_command: 'command cannot be executed in current status',
            quit: 'Quit',
            heating: 'Heating',
            completing: 'Completing',
            aborted: 'Aborted',
            completed: 'Completed',
            calibrating: 'Calibrating',
            starting: 'Starting',
            resuming: 'Resuming',
            scanning: 'Scanning',
            occupied: 'Mantaining',
            running: 'Working',
            uploading: 'Uploading',
            processing: 'Processing',
            disconnectedError: {
                caption: 'Device disconnected',
                message: 'Please confirm if network access of %s is available'
            },
            noTask: 'There are currently no task to do',
            pleaseWait: 'Please Wait...',
            unknownCommand: 'command cannot be executed in current status',
            working: 'Working',
            finishing: 'Finishing',
            initiating: 'Initiating',
            unknown: 'Unknown',
            pausedFromError: 'paused from error'
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
            HEAD_OFFLINE                        : 'Device head is not connected or missing',
            HEAD_ERROR_CALIBRATING              : 'Unable to calibrate toolhead\nplease re-attach the toolhead',
            HEAD_ERROR_FAN_FAILURE              : 'Cooling fan not spinning\nSpin it with a pencil or thin stick.',
            HEAD_ERROR_HEAD_OFFLINE             : 'Toolhead not detected\nPlease re-attach the module cable',
            HEAD_ERROR_TYPE_ERROR               : 'Toolhead incorrect\nPlease attach correct toolhead',
            HEAD_ERROR_INTLK_TRIG               : 'Laser toolhead tilted\nPlease ensure the rods are connected correctly, then continue',
            'HEAD_ERROR_?'                      : 'Toolhead error\nCheck if the toolhead is abnormal',
            HARDWARE_ERROR_FILAMENT_RUNOUT      : 'Ran out of filament\nPlease insert new material',
            HARDWARE_ERROR_0                    : 'Ran out of filament\nPlease insert new material',
            HARDWARE_ERROR_PLATE_MISSING        : 'Unable to detect the base plate\nPlease put on the plate.',
            HARDWARE_ERROR_ZPROBE_ERROR         : 'Unable to calibrate the base plate\nPlease remove left-over on the nozzle',
            HEAD_ERROR_RESET                    : 'Toolhead bad connection\nPlease re-attach the toolhead, and ensure the toolhead is connected correctly',
            HARDWARE_ERROR_CONVERGENCE_FAILED   : 'Unable to calibrate the base plate\nPlease remove left-over on the nozzle',
            HARDWARE_ERROR_HOME_FAILED          : 'Unable to home to origin\nPlease remove the obstacle, and reattach the toolhead',
            HEAD_ERROR_TILT                     : 'Head tilted\nPlease check ball joint rod is attached correctly',
            HEAD_ERROR_SHAKE                    : 'Head tilted\nPlease check ball joint rod is attached correctly',
            WRONG_HEAD                          : 'Device head is unknown, please connect to a correct header',
            USER_OPERATION                      : 'machine operated by (other) user',
            RESOURCE_BUSY                       : 'Device busy\nIf the device is not running, please restart the device',
            DEVICE_ERROR                        : 'Something went wrong\nPlease restart the device',
            NO_RESPONSE                         : 'Something went wrong\nPlease restart the device',
            SUBSYSTEM_ERROR                     : 'Something went wrong\nPlease restart the device',
            HARDWARE_FAILURE                    : 'Something went wrong\nPlease restart the device',
            MAINBOARD_OFFLINE                   : 'Something went wrong\nPlease restart the device',
            HEAD_ERROR_HARDWARE_FAILURE         : 'Something went wrong with toolhead\nPlease re-attach the toolhead',
            G28_FAILED                          : 'Unable to home\nPlease remove the obstacle',
            FILAMENT_RUNOUT_0                   : 'Ran out of filament\nPlease insert new material',
            processing                          : 'Processing',
            savingPreview                       : 'Saving preview image',
            hour                                : 'h',
            minute                              : 'm',
            second                              : 's',
            left                                : 'left',
            temperature                         : 'Temperature',
            forceStop                           : 'Abort current task?',
            upload                              : 'Upload',
            download                            : 'Download',
            fileNotDownloadable                 : 'this file type is not supported for download',
            cannotPreview                       : 'Can not preview file',
            extensionNotSupported               : 'file extension not supported',
            fileExistContinue                   : 'file already exist, continue ? (will replace)',
            confirmGToF                         : 'Uploaded GCode will be converted to FCode, continue (will replace if exist)',
            updatePrintPresetSetting            : 'FLUX STUDIO has new printing preset, do you want to update? (will overwrite current parameters)',
            confirmFileDelete                   : 'Are you sure you want to delete this file?',
            task : {
                EXTRUDER                        : 'Printing Task',
                LASER                           : 'Engraving Task'
            },
            device : {
                EXTRUDER                        : 'Printing Toolhead',
                LASER                           : 'Laser Toolhead'
            }
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
            ok: 'OK',
            yes: 'YES',
            no: 'NO',
            stop: 'Stop'
        },
        color: {
            green: 'GREEN',
            red: 'RED',
            black: 'BLACK',
            turquoise: 'TURQUOISE',
            orange: 'ORANGE',
            gray: 'GRAY',
            blue: 'BLUE',
            brown: 'BROWN',
            white: 'WHITE',
            purple: 'PURPLE',
            yellow: 'YELLOW',
            transparent: 'TRANSPARENT'
        },
        caption: {
            connectionTimeout: 'Connection timeout'
        },
        message: {
            connecting: 'Connecting...',
            connected: 'Connected',
            machineNotConnected: 'Machine is not connected',
            notPrinting: 'Printing is not in progress',
            nothingToPrint: 'Nothing to print (source blob missing)',
            connectionTimeout: 'Please check your network state and FLUX Device\'s Wi-Fi indicator.',
            device_not_found: {
                caption: 'Default device not found',
                message: 'Please check your FLUX\'s Wi-Fi indicator'
            },
            device_busy: {
                caption: 'Device Busy',
                message: 'The device is executing another task, try again later. If it stops working, please restart the device.'
            },
            device_is_used: 'The device is being used, do you want to abort current task?',
            invalidFile: 'The file is not a valid stl file',
            failGeneratingPreview: 'Fail to generate preview',
            slicingFailed: 'slic3r is unable to slice this model',
            no_password: {
                content: 'Setup machine password via USB to enable connection for this computer',
                caption: 'Password not set'
            },
            gCodeAreaTooBigCaption: 'Toolpath out of range',
            gCodeAreaTooBigMessage: 'Please reduce the size of the object(s), or try to turn off raft, brim or skirt',
            image_is_too_small: 'The file contains unsupported information',
            monitor_too_old: {
                caption: 'Firmware Outdated',
                content: 'Please install the latest firmware with <a target="_blank" href="http://helpcenter.flux3dp.com/hc/en-us/articles/216251077">this guide</a>.'
            },
            cant_establish_connection: 'Unable to initiate FLUX API, kindly use Help > Bug Report to export debug message and <a href="https://flux3dp.zendesk.com/hc/en-us/requests/new" target="_blank">contact FLUX support.</a>',
            fcodeForLaser: 'This is a fcode for laser',
            confirmFCodeImport: 'Importing fcode will remove all objects on the scene, are you sure?',
            confirmSceneImport: 'Importing .fsc will remove all objects on the scene, are you sure?'
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
            UNKNOWN: ''
        },
        change_filament: {
            home_caption: 'Change Filament',
            load_filament_caption: 'LOAD FILAMENT',
            unload_filament_caption: 'UNLOAD FILAMENT',
            cancel: 'CANCEL',
            load_filament: 'Load Filament',
            unload_filament: 'Unload Filament',
            next: 'NEXT',
            heating_nozzle: 'Heating nozzle',
            unloading: 'Unloading Filament',
            loaded: 'Filament Loaded',
            unloaded: 'Filament Unloaded',
            ok: 'OK',
            auto_emerging: 'Please insert filament',
            maintain_head_type_error: 'Toolhead not installed correctly',
            maintain_zombie: 'Please restart the device'
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
            set_first_default: 'Do you want to set "%s" as your default device?',
            startWithFilament: 'Let\'s start with loading filament',
            startWithModel: 'Next, let\'s import some 3D model',
            startTour: 'Welcome!<br/>This is your first time printing,<br/>would you like to start printing tutorial?',
            clickToImport: 'Click to import 3D model',
            selectQuality: 'Select quality you preferred',
            clickGo: 'Prepare to print',
            startPrint: 'Apply glue on the plate, and start to print',
            skip: 'Skip tutorial'
        },
        slicer: {
            computing: 'Computing'
        }
    };
});
