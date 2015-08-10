define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        welcome_headline : 'Welcome to FLUX',
        app : {
            name : 'Flux Studio - en'
        },
        welcome: {
            header1: 'Hello! Welcome to FLUX. Please choose your preferred language',
            header2: 'We are getting started from your language',
            start: 'Start'
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
            print: 'Print',
            laser: 'Laser',
            scan: 'Scan',
            usb: 'USB'
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
            import: 'Import',
            go_home: 'Go Home',
            save: 'Save',
            normal_preview: 'Normal Preview',
            support_preview: 'Support Preview',
            start_print: 'Print',
            advanced: {
                label: 'ADVANCED',
                quality: 'QUALITY',
                layer_height: 'Layer Height',
                infill: 'Infill',
                speed: 'SPEED',
                speed_while_traveling: 'Traveling',
                speed_while_extruding: 'Extruding',
                temperature: 'TEMPERATURE',
                printing_temperature: 'Printing',
                support: 'SUPPORT',
                support_type: {
                    label: 'Support Type',
                    touch_buildplate: 'Touch Buildplate',
                    everywhere: 'Everywhere'
                },
                platform_type: 'Platform Type',
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
            restart: 'RESTART'
        },
        laser: {
            import: 'Import',
            save: 'Save',
            acceptable_files: 'JPG, PNG, PDF, AI',
            drop_files_to_import: 'Drop your file here or click "import" to upload your file',
            advenced: 'Advenced',
            start_engrave: 'ENGRAVE',
            start_cut: 'CUT',
            print_params: {
                object_height: {
                    text: 'Object Height',
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
                unit: {
                    text: 'Unit',
                    options: [
                        {
                            value: 'mm',
                            label: 'mm',
                            checked: true
                        },
                        {
                            value: 'inches',
                            label: 'inches'
                        }
                    ]
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
                        text: 'Material',
                        label: 'Object Options',
                        options: [
                            {
                                value: 'wood',
                                label: 'Wood',
                                selected: true,
                                data: {
                                    laser_speed: 10,
                                    power: 10
                                }
                            },
                            {
                                value: 'steel',
                                label: 'Steel',
                                data: {
                                    laser_speed: 50,
                                    power: 50
                                }
                            }
                        ]
                    },
                    laser_speed: {
                        text: 'Laser Speed',
                        unit: 'mm/s',
                        fast: 'Fast',
                        slow: 'Slow',
                        min: 1,
                        max: 100
                    },
                    power: {
                        text: 'Power',
                        high: 'High',
                        low: 'Low',
                        min: 1,
                        max: 50
                    }
                },
                apply: 'Apply',
                cancel: 'Cancel',
            }
        },
        scan: {
            start_scan: 'Scan',
            start_multiscan: 'Start to Multiscan',
            rescan: 'Rescan',
            export: 'Export',
            share: 'Share',
            print_with_flux: 'Print with FLUX',
            convert_to_3d_model: 'Convert to 3D model...',
            complete: 'Completed',
            remaining_time: 'Remaining Time',
            save_as: 'Save as',
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
        }
    };
});