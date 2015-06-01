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
                cancel: '取消',
                join: '加入',
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
            flux_as_wifi_1: {
                caption: 'We\'re configuring your FLUX as a wifi station',
                description: 'so you can control your FLUX through wifi network',
                next: 'next',
                footer: 'I want to swtich back to wifi connection'
            },
            flux_as_wifi_2: {
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
                disconnect_with_this_printer: 'Disconnect With This Printer'
            },
            flux_cloud: {
                caption: 'Get FLUX 3D Printer be remote!',
                line1: 'Control your FLUX 3D Printer with FLUX Cloud in anywhere you are',
                start_to_use: 'Start to Use',
                i_have_an_account: 'I have an account'
            }
        },
        print: {
            import: 'Import',
            go_home: 'Go home',
            save: 'Save',
            normal_preview: 'Normal Preview',
            start_print: 'Print',
            advanced: 'Advanced',
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
                    meterial: {
                        text: 'Meterial',
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
            }
        },
        laser: {
            import: 'Import',
            save: 'Save',
            acceptable_files: 'JPG, PNG, PDF, AI',
            drop_files_to_import: 'Drop your file here or click "import" to upload your file',
            change_setup: 'Change Setup',
            start_laser: 'Start',
            print_params: {
                method: {
                    text: 'Method',
                    options: {
                        engrave: 'Engrave'
                    }
                },
                meterial: {
                    text: 'Meterial',
                    options: [
                        {
                            value: 'wood',
                            label: 'Wood',
                            selected: true
                        }
                    ]
                },
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
                    text: 'Unit'
                }
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
            complete: 'Complete',
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
                    ],
                    tooltip: {
                        text: '依據你的物件狀態，你可以選擇不同的亮度',
                        items: [
                            {
                                label: 'Light'
                            },
                            {
                                label: 'Normal'
                            },
                            {
                                label: 'Dark'
                            }
                        ]
                    }
                }
            }
        }
    };
});