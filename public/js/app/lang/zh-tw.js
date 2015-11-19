define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - zh-tw'
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
            next: '下一步',
            start: '開始設定',
            skip: '跳過',
            cancel: '取消',
            confirm: '確認',
            connect: '連接',

            // specific caption/content
            select_language: '請選擇你想使用的語言',
            change_password: '要更改密碼嗎?',
            connect_flux: '用 USB 連接你的電腦',
            name_your_flux: '命名你的 FLUX',
            why_need_name: '當工作站模式啟動時，這將會被用作 Wi-Fi 名稱',
            wifi_setup: 'Wi-Fi Setup',
            select_preferred_wifi: '選擇你偏好的網路',
            requires_wifi_password: '需要密碼',
            connecting: '連接中...',

            // page specific
            set_machine_generic: {
                printer_name: 'Name',
                printer_name_placeholder: '請輸入名稱',
                password: 'Password',
                set_station_mode: 'Set station mode',
                password_placeholder: '請輸入密碼'
            },

            setting_completed: {
                start: '開始使用',
                is_ready: '“%s” 準備好了',
                station_ready_statement: '你的 FLUX 已成為 Wi-Fi 熱點，你可以藉由無線連接“%s”這個熱點操作 FLUX',
                brilliant: 'Brilliant!',
                begin_journey: 'You can begin the journey with your FLUX now.',
                great: 'Great!',
                upload_via_usb: 'You can setup Wi-Fi later, or use USB drive to print.',
                back: 'Back',
                ok: 'OK'
            },

            // errors
            errors: {
                error: 'Error',

                keep_connect: {
                    caption: '無法連接裝置',
                    content: '請確認電源已被開啟及已經由 micro-usb 連接'
                },

                wifi_connection: {
                    connecting_fail: '連接失敗'
                },

                select_wifi: {
                    ap_mode_fail: '設定失敗'
                }
            }
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
                connecting: '連線中',
                no_selected: '請選擇 Wifi'
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
            laser: '雷雕',
            scan: '掃描',
            usb: 'USB',
            device: '裝置',
            setting: '設定'
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
            import: '打開⋯',
            go_home: 'Go Home',
            save: '儲存⋯',
            normal_preview: 'Normal Preview',
            support_view: 'Support Preview',
            start_print: '列印',
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
                loadPreset: 'LOAD PRESET',
                apply: 'APPLY',
                saveAsPreset: 'SAVE AS PRESET',
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
                        text: '列印速度',
                        options: [
                            {
                                value: 'slow',
                                label: '中'
                            },
                            {
                                value: 'fast',
                                label: '快',
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
                        text: '支撐',
                        on: '支撐',
                        off: '關閉',
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
                        text: '平台',
                        options: [
                            {
                                value: 'raft',
                                label: '墊片',
                                selected: true
                            }
                        ]
                    }
                },
                expert: {
                    layer_height: {
                        text: '每層高度',
                        value: 0.3,
                        unit: 'mm'
                    },
                    print_speed: {
                        text: '列印速度',
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
                plaTitle: 'PICK THE COLOR OF THE FILAMENT'
            },
            right_panel: {
                get: 'Get',
                go: 'Go',
                preview: '預覽'
            },
            quality: {
                high: 'High Quality',
                good: 'Good Quality',
                normal: 'Normal Quality',
                quick: 'Quick Quality',
                fast: 'Fast Quality'
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
            import: '打開⋯',
            save: '儲存⋯',
            custom: '自訂',
            presets: 'Presets',
            acceptable_files: 'JPG, PNG, SVG',
            drop_files_to_import: 'Drop your file here or click "import" to upload your file',
            button_advanced: '進階',
            confirm: '確認',
            start_engrave: '雕刻',
            start_cut: '切割',
            close_alert: '關閉',
            get_fcode: 'Get Fcode',
            name: '名稱',
            go: 'GO',
            print_params: {
                object_height: {
                    text: '物體高度',
                    unit: 'mm'
                }
            },
            object_params: {
                position: {
                    text: '位置'
                },
                size: {
                    text: '尺寸',
                    unit: {
                        width: '寬',
                        height: '高'
                    }
                },
                rotate: {
                    text: '旋轉'
                },
                threshold: {
                    text: '圖片曝光',
                    default: 128
                }
            },
            advanced: {
                label: '設定',
                form: {
                    object_options: {
                        text: '材質',
                        label: '材質選項',
                        options: [
                            {
                                value: 'wood',
                                label: '木材',
                                data: {
                                    laser_speed: 5,
                                    power: 255
                                }
                            },
                            {
                                value: 'steel',
                                label: '皮革',
                                data: {
                                    laser_speed: 50,
                                    power: 255
                                }
                            },
                            {
                                value: 'paper',
                                label: '紙',
                                data: {
                                    laser_speed: 10,
                                    power: 25
                                }
                            },
                            {
                                value: 'cork',
                                label: '軟木',
                                data: {
                                    laser_speed: 15,
                                    power: 200
                                }
                            },
                            {
                                value: 'other',
                                label: '其它',
                                data: {}
                            }
                        ]
                    },
                    laser_speed: {
                        text: '雷射速度',
                        unit: 'mm/s',
                        fast: '快',
                        slow: '慢',
                        min: 0.1,
                        max: 20,
                        step: 0.1
                    },
                    power: {
                        text: '雷射強度',
                        high: '強',
                        low: '弱',
                        min: 0,
                        max: 255,
                        step: 1
                    }
                },
                save_and_apply: '儲存並套用',
                save_as_preset: '儲存',
                load_preset: '載入',
                apply: '套用',
                cancel: '取消',
                save: '儲存'
            }
        },
        scan: {
            start_scan: '開始掃瞄',
            cancel_scan: '取消',
            convert_to_stl: '轉換成 STL',
            scan_again: '再次掃描',
            start_multiscan: '多次掃描',
            convert_to_3d_model: '掃描中⋯',
            complete: '掃描進度',
            remaining_time: '剩餘時間',
            elapsed_time: '已用時間',
            do_save: '儲存⋯',
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
                    text: '掃描速度',
                    options: [
                        {
                            value: '400',
                            label: '快',
                            selected: true
                        },
                        {
                            value: '800',
                            label: '慢'
                        }
                    ]
                },
                object: {
                    text: '物體類型',
                    options: [
                        {
                            value: 'auto',
                            label: '自動',
                            selected: true
                        },
                        {
                            value: 'manually',
                            label: '手動'
                        }
                    ]
                },
                luminance: {
                    text: '環境光源',
                    options: [
                        {
                            value: 'light',
                            label: '較亮',
                            selected: true
                        },
                        {
                            value: 'normal',
                            label: '普通'
                        },
                        {
                            value: 'dark',
                            label: '較暗'
                        }
                    ]
                }
            },
            manipulation: {
                smooth: '平滑化',
                crop: '剪裁',
                auto_merge: '自動合併',
                manual_merge: '手動合併',
                clear_noise: '去除噪點',
                reset: '重設'
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
            retry: '重試',
            status: '狀態',
            busy: '忙碌中',
            ready: '就緒',
            reset: '重設(kick)',
            abort: '取消工作',
            start: '開始',
            noTask: '目前無任何工作',
            pleaseWait: '請稍待...',
            unknownCommand: '指令無法在此狀態下被執行',
            quit: '中斷連結'
        },
        monitor: {
            change_filament: 'CHANGE FILLAMENT',
            browse_file: 'BROWSE FILE',
            monitor: 'MONITOR'
        },
        alert: {
            caption: '錯誤',
            duplicated_preset_name: '重複的Preset名稱',
            info: '訊息',
            warning: '警告',
            error: '錯誤'
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
