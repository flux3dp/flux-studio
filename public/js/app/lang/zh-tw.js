define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        welcome_headline : 'Welcome to FLUX',
        app : {
            name : 'Flux Studio - zh-tw'
        },
        welcome: {
            header1: 'Hello! 歡迎使用 FLUX，快點來實現你的點子',
            header2: '請選擇你想使用的語言，我們即將開始為 FLUX 進行設定 :)',
            start: '開始設定 '
        },
        wifi: {
            home: {
                line1: '請問你所處的環境擁有可以連線的 Wi-Fi 嗎?',
                line2: '我們將協助你將 FLUX 連線至你家中的 Wi-Fi',
                select: '是的，開始連線',
                no_available_wifi: '不，我現在沒有 Wi-Fi'
            },
            select: {
                choose_wifi: '請選擇你要連線的 Wi-Fi',
                no_wifi_available: '暫時找不到可以連線的 Wi-Fi'
            },
            set_password: {
                line1: '請輸入「',
                line2: '」無線網路的連線密碼',
                password_placeholder: '請輸入 Wi-Fi 密碼',
                back: '上一步',
                join: '加入',
                connecting: '連線中'
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
                caption: '已經完成所有的設定了！',
                description: '快點開始進行你的第一次列印',
                start: '開始使用'
            },
            configuring_flux: {
                caption: '我們正在讓你的FLUX變成一個無線基地台...',
                description: '如此一來，你就可以透過內部的網路來控制你的FLUX',
                next: '下一步',
                footer: '我想要改回使用Wifi連線'
            },
            configured_flux: {
                caption: '你的FLUX已經成為一個無線基地台',
                description: '只剩下為你的FLUX做一些簡單的設定就可以開始使用了 :)',
                next: '下一步',
                footer: '我想要改回使用Wifi連線'
            }
        },
        menu: {
            print: '列印',
            laser: 'Laser',
            scan: 'Scan',
            usb: 'USB',
            device: '裝置'
        },
        settings: {
            caption: '設定',
            tabs: {
                general: '一般',
                flux_cloud: 'FLUX Could',
                printer: '成型機'
            },
            language: '語言',
            notifications: '通知',
            close: '關閉',
            printer: {
                new_printer: '新增成型機',
                name: '成型機名稱',
                current_password: '目前密碼',
                set_password: '設定密碼',
                security_notice: '你可以用密碼保護你的成型機',
                connected_wi_fi: 'Wi-Fi 連線',
                advanced: '進階',
                join_other_network: '加入其它網路',
                disconnect_with_this_printer: '中斷這台成型機的連線',
                your_password: '新密碼',
                confirm_password: '確認密碼',
                save_password: '儲存變更'
            },
            flux_cloud: {
                caption: 'Get FLUX 3D Printer be remote!',
                line1: 'Control your FLUX 3D Printer with FLUX Cloud in anywhere you are',
                start_to_use: 'Start to Use',
                i_have_an_account: 'I have an account',
                email: '電子信箱',
                password: '密碼',
                change_password: '變更密碼',
                connected_printer: '已連接成型機',
                connect: '連接'
            },
            cancel: '取消',
            done: '完成',
            create_account: {
                create_account: '建立新帳號',
                your_email: '電子郵件',
                password: '密碼',
                confirm_password: '確認密碼',
                signup: '建立帳號',
                not_now: '目前先跳過'
            },
            activate_info:  {
                almost_there: '最後一步了!',
                description: '到Email帳號裡面使用連結啟動帳號',
                got_it: '瞭解了！'
            },
            connect_printer: {
                title: '選擇連接成型機'
            }
        },
        print: {
            import: 'Import',
            go_home: 'Go Home',
            save: 'Save',
            normal_preview: 'Normal Preview',
            support_view: 'Support Preview',
            start_print: 'Print',
            advanced: {
                label: '進階設定',
                quality: 'QUALITY',
                layer_height: 'Layer Height',
                infill: 'Infill',
                speed: 'SPEED',
                speed_while_traveling: 'Speed While Traveling',
                speed_while_extruding: 'Spped While Extruding',
                temperature: 'TEMPERATURE',
                printing_temperature: 'Printing Temperature',
                support: 'SUPPORT',
                support_type: {
                    label: 'Support Type',
                    touch_buildplate: 'Touch Buildplate',
                    everywhere: 'Everywhere'
                },
                direct_setting: 'Direct Setting',
                platform_type: 'Platform Type'
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
                                label: '心則慢'
                            },
                            {
                                value: 'fast',
                                label: '世界越快',
                                selected: true
                            }
                        ]
                    },
                    material: {
                        text: '材質',
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
                        on: '開啟',
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
                                selected: true
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
            scale: '比例',
            rotate: '旋轉',
            align_center: '置中',
            delete: '刪除',
            reset: '重設',
            cancel: '取消',
            done: '確認',
            hour: '小時',
            minute: '分鐘',
            gram: '公克',
            pause: '暫停',
            continue: '繼續',
            restart: '重新開始',
            download_prompt: '請輸入檔案名稱'
        },
        laser: {
            import: 'Import',
            save: 'Save',
            acceptable_files: 'JPG, PNG, PDF, AI',
            drop_files_to_import: 'Drop your file here or click "import" to upload your file',
            button_advanced: 'Advanced',
            start_engrave: 'Engrave',
            start_cut: 'Cut',
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
                        text: '材質',
                        label: 'Object Options',
                        options: [
                            {
                                value: 'wood',
                                label: 'Wood',
                                selected: true,
                                data: {
                                    laser_speed: 10,
                                    power: 255
                                }
                            },
                            {
                                value: 'steel',
                                label: 'Steel',
                                data: {
                                    laser_speed: 50,
                                    power: 255
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
                        min: 0,
                        max: 255,
                        step: 1
                    }
                },
                apply: 'Apply',
                cancel: 'Cancel',
            }
        },
        scan: {
            start_scan: 'Scan',
            cancel_scan: 'Cancel',
            convert_to_stl: 'Convert',
            scan_again: 'Scan Again',
            start_multiscan: 'Multiscan',
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
                    text: '亮度',
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
            choose_printer: '選擇一個成型機',
            notification: '請輸入密碼',
            submit: '送出',
            please_enter_password: '請輸入密碼',
            auth_failure: '認證失敗',
            retry: '重新選擇'
        },
        device: {
            cameraOn: '啟用鏡頭',
            cameraOff: '關閉鏡頭',
            browseFiles: '瀏覽檔案',
            pause: '暫停',
            cancelTask: '終止任務',
            selectPrinter: '選擇成型機',
            retry: '重試'
        }
    };
});
