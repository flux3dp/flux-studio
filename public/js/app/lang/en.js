define(function() {
    'use strict';

    return {
        support: {
            no_webgl: 'WebGL is not supported. Please use other devices.'
        },
        device_selection: {
            no_printers: 'Cannot detect FLUX Delta through Wi-Fi. Please check if your PC and FLUX Delta are under the same network. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215394548">More Info</a>',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: 'Release Note:',
            firmware: {
                caption: 'A Firmware Update to FLUX Delta is available',
                message_pattern_1: '"%s" is now ready for firmware update.',
                message_pattern_2: 'FLUX Delta Firmware v%s is now available - You have v%s.',
                latest_firmware: {
                    caption: 'Delta Firmware Update',
                    message: 'You have the latest Delta firmware'
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
                update_fail: 'Update Fail'
            },
            updating: 'Updating...',
            skip: 'Skip This Version',
            later: 'LATER',
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
                reset: 'Reset',
                confirmReset: 'Are you sure you want to reset all settings?'
            },
            edit: {
                label: 'Edit',
                duplicate: 'Duplicate',
                rotate: 'Rotate',
                scale: 'Scale',
                reset: 'Reset',
                clear: 'Clear Scene',
                undo: 'Undo'
            },
            device: {
                label: 'Devices',
                new: 'Add a New Device',
                device_monitor: 'Dashboard',
                device_info: 'Device Info',
                change_filament: 'Change Printing Material',
                default_device: 'Set as Default',
                check_firmware_update: 'Update Firmware',
                update_delta: 'Delta Firmware',
                update_toolhead: 'Toolhead Firmware',
                calibrate: 'Calibrate'
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
            invalid_device_name: 'The name can only contains chinese, alphabet, numbers, blanks, and special characters  “(”, “)”, “-”, “_”, “’”, “\'”.',
            require_device_name: 'Name is required',
            select_language: 'Select Language',
            change_password: {
                content: 'Are you sure to change the password?',
                caption: 'Changing password'
            },
            connect_flux: 'Connect FLUX Delta',
            via_usb: 'Using USB Cable',
            via_wifi: 'Using Wi-Fi',
            name_your_flux: 'Name Your FLUX Delta',
            wifi_setup: 'Wi-Fi Setup',
            select_preferred_wifi: 'Select your preferred network.',
            requires_wifi_password: 'requires a password.',
            connecting: 'Connecting...',

            // page specific
            set_machine_generic: {
                printer_name: 'Name*',
                printer_name_placeholder: 'Give your Delta an unique name',
                old_password: 'Current Password',
                password: 'Password',
                set_station_mode: 'Create a Network',
                password_placeholder: 'Something secret',
                incorrect_old_password: 'Incorrect Current Password',
                incorrect_password: 'Incorrect Password',
                ap_mode_name: 'Network Name',
                ap_mode_pass: 'Password',
                ap_mode_name_format: 'Only accept alphabets or numbers',
                ap_mode_pass_format: 'At least 8 characters',
                ap_mode_name_placeholder: 'Up to 32 characters.',
                ap_mode_pass_placeholder: 'Must have at least 8 characters.',
                create_network: 'Create Network',
                join_network: 'Join Network',
                security: 'Security'
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

            notice_from_device: {
                headline: 'Check the Wi-Fi Indicator on FLUX Delta',
                subtitle: 'Please mind the status of Wi-Fi connection.',
                light_on: 'Light On',
                light_on_desc: 'FLUX Delta has connected to the Wi-Fi you assigned',
                breathing: 'Breathing',
                breathing_desc: 'Wi-Fi connection failed. Please try setting again.',
                successfully: 'If FLUX Delta connect successfully',
                successfully_statement: 'Please go back to your Wi-Fi list and connect to your PC to %s, then restart FLUX Studio',
                restart: 'Restart FLUX Studio'
            },

            // errors
            errors: {
                error: 'Error',
                not_found: 'Not Found',
                not_support: 'Please update Delta Firmware to v1.1+',

                keep_connect: {
                    caption: 'USB Device not found',
                    content: 'Oops! Don\'t worry. We\'re here for you.\nMake sure your FLUX Delta has been powered \non, attached to Micro USB Cable and the driver \nis installed. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215327328">More Info</a>'
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
            device: 'Device',
            setting: 'SETTING',
            draw: 'DRAW'
        },
        settings: {
            caption: 'Settings',
            tabs: {
                general: 'General',
                printer: 'Printer'
            },
            ip: 'Delta\'s IP',
            wrong_ip_format: 'Wrong IP Formats',
            language: 'Language',
            notifications: 'Notifications',
            close: 'Close',
            cancel: 'CANCEL',
            done: 'DONE',
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
            }
        },
        print: {
            import: 'IMPORT',
            save: 'Save',
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
                cura: 'Cura',
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
                curaInfill: {
                    automatic: 'AUTOMATIC',
                    grid: 'GRID',
                    lines: 'LINES',
                    concentric: 'CONCENTRIC'
                },
                curaSupport: {
                    grid: 'GRID',
                    lines: 'LINES'
                },
                blackMagic: 'Black Magic',
                spiral: 'Spiral',
                generalSupport: 'General Support',
                spacing: 'Spacing',
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
                presets: 'Presets',
                name: 'Name',
                apply: 'APPLY',
                save: 'SAVE',
                saveAsPreset: 'Save Preset',
                cancel: 'CANCEL',
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
                raftTitle: 'Raft are layers built under your parts and help them stick to the base plate',
                supportTitle: 'Support are generated structures to supportt overhanging parts of your object, in order to prevent filament dropping',
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
            button_advanced: 'ADVANCED',
            confirm: 'Confirm',
            get_fcode: 'Save<br/>Task',
            name: 'Name',
            go: 'GO',
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
                object_height: 'A Raft are layers built under your part and help it stick to the base plate.',
                shading: 'Shading enables the gradient effect of laser engraving. It takes longer time.',
                advanced: 'Custom settings for power and speed.'
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
                save_as_preset_title: 'Save Preset',
                load_preset_title: 'Load Preset',
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
            scan_again_confirm: 'Do you want to discard current scan result?',
            calibrate: 'Calibrate',
            calibration_done: {
                caption: 'Calibration Done',
                message: 'You are able to scan now'
            },
            cant_undo: 'Unable to undo',
            estimating: 'Estimating the time...',
            calibrate_fail: 'Calibration Failed',
            calibration_is_running: 'Calibrating for Scanning',
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
        select_printer: {
            choose_printer: 'Choose a printer',
            notification: 'Please enter the password',
            submit: 'SUBMIT',
            please_enter_password: 'password',
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
            finishing: 'Finishing',
            initiating: 'Initiating',
            unknown: 'Unknown',
            pausedFromError: 'paused from error',
            IP: 'IP',
            serial_number: 'Serial Number',
            firmware_version: 'Firmware Version',
            UUID: 'UUID'
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
            WRONG_HEAD                          : 'Device head is unknown, please connect to a correct toolhead',
            USER_OPERATION                      : 'Machine is being operated by (other) user',
            RESOURCE_BUSY                       : 'Device is busy\nIf the device is not running, please restart the device',
            DEVICE_ERROR                        : 'Something went wrong\nPlease restart the device',
            NO_RESPONSE                         : 'Something went wrong\nPlease restart the device',
            SUBSYSTEM_ERROR                     : '#402 Critical Error: Subsystem no response. Please contact FLUX Support.',
            HARDWARE_FAILURE                    : 'Something went wrong\nPlease restart the device',
            MAINBOARD_OFFLINE                   : 'Something went wrong\nPlease restart the device',
            G28_FAILED                          : '#124 Unable to calibrate origin (home)\nPlease remove obstacles on rails, and make sure toolhead cables are not caught by carriages.',
            FILAMENT_RUNOUT_0                   : '#121 Ran out of filament\nPlease insert new material <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218931757">More Info</a>',
            processing                          : 'Processing',
            savingPreview                       : 'Generating thumbnails',
            hour                                : 'h',
            minute                              : 'm',
            second                              : 's',
            left                                : 'left',
            temperature                         : 'Temperature',
            forceStop                           : 'Abort current task?',
            upload                              : 'Upload',
            download                            : 'Download',
            fileNotDownloadable                 : 'This file type is not supported for download',
            cannotPreview                       : 'Can not preview this file',
            extensionNotSupported               : 'File format not supported',
            fileExistContinue                   : 'File already exist, do you want to replace it?',
            confirmGToF                         : 'Uploaded GCode will be converted to FCode, continue (will replace if exist)',
            updatePrintPresetSetting            : 'FLUX STUDIO has new printing preset, do you want to update?\n(will overwrite current parameters)',
            confirmFileDelete                   : 'Are you sure you want to delete this file?',
            task: {
                EXTRUDER                        : 'Printing Task',
                LASER                           : 'Engraving Task',
                DRAW                            : 'Drawing Task',
                'N/A'                           : 'Drawing Task'
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
            connected: 'Connected',
            machineNotConnected: 'Machine is not connected',
            notPrinting: 'Printing is not in progress',
            nothingToPrint: 'Nothing to print (source blob missing)',
            connectionTimeout: 'Please check your network state and your Delta\'s Wi-Fi indicator.',
            device_not_found: {
                caption: 'Default Device not found',
                message: 'Please check your Delta\'s Wi-Fi indicator'
            },
            device_busy: {
                caption: 'Device Busy',
                message: 'The device is executing another task, try again later. If it stops working, please restart the device.'
            },
            device_is_used: 'The device is being used, do you want to abort current task?',
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
            fcodeForLaser: 'This is a fcode for engraving',
            fcodeForPen: 'This is a fcode for drawing',
            confirmFCodeImport: 'Importing fcode will remove all objects on the scene, are you sure?',
            confirmSceneImport: 'Importing .fsc will remove all objects on the scene, are you sure?',
            brokenFcode: 'Unable to open %s',
            slicingFatalError: 'Error encountered during slicing. Kindly report STL file to customer support.',
            unknown_error: 'The application has encountered an unknown error, please use Help > Menu > Bug Report.',
            important_update: {
                caption: 'Important Update',
                message: 'Important Delta firmware update is available. Do you want to update now?',
            },
            unsupport_osx_version: 'Unsupported Mac OS X Version Detected',
            need_password: 'Need Password to connect to FLUX Delta',
            new_app_downloading: 'Downloading',
            ask_for_upgrade: 'Do you wanna upgrade NOW?',
            need_1_1_7_above: 'Please update Delta Firmware to v1.1.7+'
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
                '8': '#116 Engraving toolhead tilt detected \nPlease ensure the rods are connected correctly. <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/217085937">More Info</a>',
                '9': '#118 Printer toolhead is unable to heat. Please contact FLUX Support.'
            }
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
            maintain_zombie: 'Please restart the device',
            toolhead_no_response: '#117 Module no response <a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/218347477">More</a>'
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
            clickToImport: 'Click here to import an example 3D model',
            selectQuality: 'Select quality you preferred',
            clickGo: 'Prepare to print',
            startPrint: 'Apply glue on the plate with no-grid, wait till it\' dry, then you are ready to print',
            skip: 'Skip Tutorial'
        },
        slicer: {
            computing: 'Computing',
            error: {
                '6': 'Calculated toolpath is out of working area. Please reduce the size of the object(s), or try to turn off raft, brim or skirt.',
                '7': 'Error occurred while setting advanced parameters.',
                '8': 'API returned empty result.\nRequest for result is probably called before slice complete',
                '9': 'API returned empty path.\nRequest for toolpath is probably called before slice complete',
                '10': 'Missing object data. The source object is missing from slicer engine',
                '13': 'Duplication error\nThe selected ID does not exist. If the error is not resolved by restarting FLUX Studio, please report this error.',
                '14': 'Error occurred whil setting position. The source object is missing in slicer engine.',
                '15': 'Uploaded file is corrupt, please check the file and try again.'
            },
            pattern_not_supported_at_100_percent_infill: 'Slic3r only supports 100% infill with rectilinear infill pattern'
        },
        calibration: {
            RESOURCE_BUSY: 'Please make sure the machine is in idle status',
            headMissing: 'Cannot retrieve head module information, please make sure it\'s attached'
        }
    };
});
