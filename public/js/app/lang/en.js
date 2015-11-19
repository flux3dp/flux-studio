define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - en'
        },
        device_selection: {
            device_name: 'DEVICE NAME',
            module: 'MODULE',
            status: 'STATUS'
        },
        topmenu: {
            flux: {
                label: 'Flux',
                about: 'About FLUX studio',
                preferences: 'Preferences',
                quit: 'Quit'
            },
            file: {
                label: 'File',
                import: 'Import',
                recent: 'Recent',
                execute: 'Execute',
                save_gcode: 'Save Gcode'
            },
            edit: {
                label: 'Edit',
                copy: 'Copy',
                cut: 'Cut',
                paste: 'Paste',
                duplicate: 'Duplicate',
                scale: 'Scale',
                rotate: 'Rotate',
                clear: 'Clear Scene'
            },
            view: {
                label: 'View',
                standard: 'Standard',
                preview: 'Gcode Preview'
            },
            device: {
                label: 'Device',
                new: 'Add New Device...'
            },
            window: {
                label: 'Window',
                minimize: 'Minimize',
                fullscreen: 'Fullscreen'
            },
            help: {
                label: 'Help',
                starting_guide: 'Starting Guide',
                online_support: 'Online Support',
                troubleshooting: 'Troubleshooting'
            }
        },
        initialize: {
            // generic strings
            next: 'Next',
            start: 'START',
            skip: 'Skip',
            cancel: 'CANCEL',
            confirm: 'Confirm',
            connect: 'Connect',

            // specific caption/content
            select_language: 'Select Language',
            change_password: 'Change password?',
            connect_flux: 'Connect FLUX to Your Computer by USB Cable',
            name_your_flux: 'Name Your FLUX',
            why_need_name: 'This will be used as Wi-Fi ap name if station mode is enabled.',
            wifi_setup: 'Wi-Fi Setup',
            select_preferred_wifi: 'Select your preferred network.',
            requires_wifi_password: 'requires a password.',
            connecting: 'Connecting...',

            // page specific
            set_machine_generic: {
                printer_name: 'Name',
                printer_name_placeholder: 'Printer\'s Name',
                password: 'Password',
                set_station_mode: 'Set station mode',
                password_placeholder: 'Password'
            },

            setting_completed: {
                start: 'Start',
                is_ready: '“%s” is ready',
                station_ready_statement: 'Your FLUX is now a Wi-Fi station, you can use your FLUX wirelessly by connect to Wi-Fi “%s”',
                brilliant: 'Brilliant!',
                begin_journey: 'You can begin the journey with your FLUX now.',
                great: 'Great!',
                upload_via_usb: 'You can setup Wi-Fi later, or use USB drive to print.',
                back: 'Back',
                ok: 'OK!'
            },

            // errors
            errors: {
                error: 'Error',

                keep_connect: {
                    caption: 'Unable to detect FLUX device',
                    content: 'Please make sure your FLUX has been powered on and attached to micro-usb cord.'
                },

                wifi_connection: {
                    connecting_fail: 'Connecting Fail.'
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
            setting: 'SETTING'
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
                custom: 'Custom',
                slicingEngine: 'Slicing Engine',
                slic3r: 'Slic3r',
                experiment: 'Experiment',
                filament: 'Filament',
                temperature: 'Temperature',
                layerHeight: 'Layer Height',
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
                honeycomb: 'honeycomb',             // do not change
                blackMagic: 'Black Magic',
                spiral: 'Spiral',
                generalSupport: 'General Support',
                spacing: 'Spacing',
                overhang: 'Overhang',
                zDistance: 'Z Distance',
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
                config: 'Config',
                presets: 'Presets',
                name: 'Name',
                loadPreset: 'LOAD',
                apply: 'APPLY',
                saveAsPreset: 'SAVE AS',
                cancel: 'CANCEL',
                saveAndApply: 'SAVE & APPLY'
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
                transparent: 'TRANSPARENT'
            },
            right_panel: {
                get: 'Get',
                go: 'Go',
                preview: 'Preview'
            },
            quality: {
                high: 'HIGH QUALITY',
                good: 'GOOD QUALITY',
                normal: 'NORMAL QUALITY',
                quick: 'QUICK QUALITY',
                fast: 'FAST QUALITY'
            },
            quick_print: 'Quick Print',
            scale: 'Scale',
            rotate: 'Rotate',
            align_center: 'Align Center',
            delete: 'Delete',
            reset: 'Reset',
            cancel: 'CANCEL',
            done: 'DONE',
            hour: 'hr',
            minute: 'min',
            gram: 'g',
            pause: 'PAUSE',
            continue: 'CONTINUE',
            restart: 'RESTART',
            download_prompt: 'please enter file name'
        },
        laser: {
            import: 'Import',
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
            get_fcode: 'Get Fcode',
            name: 'Name',
            go: 'GO',
            print_params: {
                object_height: {
                    text: 'OBJECT HEIGHT',
                    unit: 'mm'
                }
            },
            object_params: {
                position: {
                    text: 'POSITION'
                },
                size: {
                    text: 'SIZE',
                    unit: {
                        width: 'Width',
                        height: 'Height'
                    }
                },
                rotate: {
                    text: 'ROTATE'
                },
                threshold: {
                    text: 'Threshold',
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
                load_preset: 'LOAD',
                apply: 'APPLY',
                cancel: 'CANCEL',
                save: 'SAVE'
            }
        },
        scan: {
            start_scan: 'Scan',
            cancel_scan: 'Cancel',
            convert_to_stl: 'Convert',
            scan_again: 'Scan Again',
            start_multiscan: ' Multiscan',
            convert_to_3d_model: 'Convert to 3D model...',
            complete: 'Completed',
            remaining_time: 'Remaining Time',
            elapsed_time: 'Elapsed Time',
            do_save: 'Save',
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
            scan_params: {
                scan_speed: {
                    text: 'Scan Speed',
                    options: [
                        {
                            value: '400',
                            label: 'Fast Scan',
                            selected: true
                        },
                        {
                            value: '800',
                            label: 'Delegate Scan'
                        }
                    ]
                },
                object: {
                    text: 'Object',
                    options: [
                        {
                            value: 'auto',
                            label: 'Auto',
                            selected: true
                        },
                        {
                            value: 'manually',
                            label: 'Manually'
                        }
                    ]
                },
                luminance: {
                    text: 'Luminance',
                    options: [
                        {
                            value: 'light',
                            label: 'Light',
                            selected: true
                        },
                        {
                            value: 'normal',
                            label: 'Normal'
                        },
                        {
                            value: 'dark',
                            label: 'Dark'
                        }
                    ]
                }
            },
            manipulation: {
                smooth: 'Smooth',
                crop: 'Crop',
                auto_merge: 'Auto Merge',
                manual_merge: 'Manual Merge',
                clear_noise: 'Clear Noise',
                reset: 'Reset'
            }
        },
        select_printer: {
            choose_printer: 'Choose a printer',
            notification: 'Please enter the password',
            submit: 'Submit',
            please_enter_password: 'Enter the password',
            auth_failure: 'Authentication fail',
            retry: 'Retry'
        },
        device: {
            cameraOn: 'Open Camera',
            cameraOff: 'Close Camera',
            browseFiles: 'Browse Files',
            pause: 'Pause',
            cancelTask: 'Cancel Task',
            selectPrinter: 'Select Printer',
            retry: 'Retry',
            status: 'Status',
            busy: 'Busy',
            ready: 'Ready',
            reset: 'Reset (Kick)',
            abort: 'Abort',
            start: 'Start',
            noTask: 'There are currently no task to do',
            pleaseWait: 'Please Wait...',
            unknownCommand: 'command cannot be executed in current status',
            quit: 'Quit'
        },
        monitor: {
            change_filament: 'CHANGE FILLAMENT',
            browse_file: 'BROWSE FILE',
            monitor: 'MONITOR'
        },
        alert: {
            caption: 'Error',
            duplicated_preset_name: 'Duplicated preset name',
            info: 'INFO',
            warning: 'WARNING',
            error: 'ERROR'
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
        }
    };
});
