define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - zh-tw'
        },
        support: {
            no_webgl: '您的系統不支援 WebGL'
        },
        device_selection: {
            no_printers: '未偵測到 FLUX Delta, 請檢查您與機器的網路連線是否在同個網路下',
            device_name: 'DEVICE NAME',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: 'Release Note:',
            firmware: {
                caption: 'FLUX 有新的韌體更新',
                message_pattern_1: '"%s" 有新的韌體更新。',
                message_pattern_2: 'FLUX Firmware %s 可使用 - 你的版本為 %s.'
            },
            software: {
                caption: 'FLUX Studio 有新的軟體更新',
                message_pattern_1: 'FLUX Studio 有新的軟體更新。',
                message_pattern_2: 'FLUX Software %s 可使用 - 你的版本為 %s.'
            },
            skip: '跳過此版本',
            later: '稍候',
            install: '下載'
        },
        topmenu: {
            version: '版本',
            sure_to_quit: '確定要結束 FLUX Studio?',
            flux: {
                label: 'Flux',
                about: '關於 FLUX studio',
                preferences: '偏好設定',
                quit: '結束'
            },
            file: {
                label: '檔案',
                import: '匯入',
                save_gcode: '匯出 Gcode',
                save_fcode: '匯出工作'
            },
            edit: {
                label: '編輯',
                duplicate: '重製',
                clear: '清除場景'
            },
            device: {
                label: '裝置',
                new: '新增裝置',
                device_monitor: '狀態',
                change_filament: '自動換料',
                default_device: '設為預設裝置'
            },
            window: {
                label: '視窗',
                minimize: '最小化',
                fullscreen: '全螢幕'
            },
            help: {
                label: '說明',
                starting_guide: '開始使用',
                online_support: '線上支援',
                troubleshooting: '錯誤排除',
                tutorial: '列印教學',
                debug: '錯誤回報'
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
            no_machine : '目前沒有機器，跳過此步驟',

            // specific caption/content
            invalid_device_name: '裝置名稱只能使用英文字母、數字、空格以及特殊字元 “-”, “_”, “’”, “\'”',
            require_device_name: '名稱欄位為必填',
            select_language: '請選擇你想使用的語言',
            change_password: {
                caption: '密碼更改',
                content: '要更改密碼嗎?'
            },
            connect_flux: '用 USB 連接你的電腦與 FLUX 裝置',
            name_your_flux: '為你的 FLUX Delta 取一個獨特的名字',
            wifi_setup: '設定無線網路',
            select_preferred_wifi: '選擇你偏好的網路',
            requires_wifi_password: '需要密碼',
            connecting: '連接中',

            // page specific
            set_machine_generic: {
                printer_name: '裝置名稱*',
                printer_name_placeholder: '例如：霹靂五號',
                password: '裝置密碼',
                set_station_mode: '設定成無線基地台',
                password_placeholder: '密碼可以保護你的 FLUX Delta'
            },

            setting_completed: {
                start: '開始使用',
                is_ready: '“%s” 準備完成',
                station_ready_statement: '你的 FLUX Delta 已成為 Wi-Fi 熱點，你可以藉由無線連接 “%s” 這個熱點操作 FLUX',
                brilliant: '太棒了!',
                begin_journey: '你可以拔除 Micro USB 傳輸線, 開始使用 FLUX Delta 隨心所欲地進行創作囉！',
                great: '歡迎使用 FLUX Studio',
                upload_via_usb: '你可以稍後再設定 Wi-Fi 選項。<br/>如果你沒有 Wi-Fi 環境，請參考<a target="__blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215998327-Connection-Guide-for-Desktop-PCs">PC連線指南</a>',
                back: '回到 Wi-Fi 設定',
                ok: '開始使用'
            },

            // errors
            errors: {
                error: '錯誤',

                keep_connect: {
                    caption: '無法透過 USB 連接',
                    content: '別擔心！請確認電源已被開啟及使用 Micro-Usb 連接裝置，並正確安裝驅動程式。<a target="_blank" href="https://flux3dp.zendesk.com/hc/en-us/articles/215327328">...觀看更多說明</a>'
                },

                wifi_connection: {
                    caption: '無法與此 Wi-Fi 連線',
                    connecting_fail: '請確認信號強度以及密碼正確'
                },

                select_wifi: {
                    ap_mode_fail: '基地台模式連線設定失敗'
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
                no_selected: '請選擇 Wi-Fi'
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
            import: '匯入',
            go_home: 'Go Home',
            save: '儲存⋯',
            normal_preview: 'Normal Preview',
            support_view: 'Support Preview',
            start_print: '列印',
            advanced: {
                general: '一般',
                layers: '切層',
                infill: '填充',
                support: '支撐',
                speed: '速度',
                custom: '專家',
                slicingEngine: '切片引擎',
                slic3r: 'Slic3r',
                experiment: 'Experiment',
                filament: '料捲',
                temperature: '溫度',
                layer_height_title: '層高',
                layer_height: '一般層高',
                firstLayerHeight: '底層層高',
                shell: '物件外殼',
                shellSurface: '物件外殼圈數',
                solidLayerTop: '頂部實心層數',
                solidLayerBottom: '底部實心層數',
                density: '填充密度',
                pattern: '填充圖樣',
                auto: 'auto',                       // do not change
                line: 'line',                       // do not change
                rectilinear: 'rectilinear',         // do not change
                rectilinearGrid: 'rectilinear-grid',// do not change
                honeycomb: 'honeycomb',             // do not change
                blackMagic: '黑魔法',
                spiral: '螺旋',
                generalSupport: '支撐',
                spacing: '支撐間隙',
                overhang: '懸空角度',
                zDistance: 'Z Distance',
                support_pattern: '支撐圖樣',
                raft: '底座',
                raftLayers: '底座層數',
                movement: '移動速度',
                structure: '結構速度',
                traveling: '移動',
                surface: '表面速度',
                firstLayer: '底層',
                solidLayers: '實心層',
                innerShell: '外殼內圈',
                outerShell: '外殼外圈',
                bridge: '架橋',
                config: 'Config',
                presets: '預設',
                name: 'Name',
                apply: '套用',
                save: '儲存',
                saveAsPreset: '存為預設',
                cancel: '取消',
                saveAndApply: '套用設定',
                delete: '刪除',
                loadPreset: '載入預設',
                savePreset: '儲存預設'
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
                raft_on: '底座 ON',
                raft_off: '底座 OFF',
                support_on: '支撐 ON',
                support_off: '支撐 OFF',
                advanced: '進階選項',
                preview: '預覽路徑',
                plaTitle: 'PICK THE COLOR OF THE FILAMENT',
                transparent: 'TRANSPARENT',
                qualityTitle: 'It will affect the outcome surface smoothness of your object. Better qualities need more time',
                raftTitle: 'A Raft are layers built under your part and help it stick to the base plate',
                supportTitle: 'A Support is a generated structure to support overhanging part of your object, to prevent filament dropping',
                previewTitle: 'Preview the actual path of toolhead during printing task',
                advancedTitle: 'Detail 3d printing parameters, you may acheive better result than default by adjusting them'
            },
            right_panel: {
                get: 'Get',
                go: 'Go',
                preview: '預覽'
            },
            quality: {
                high: '品質 精細',
                med: '品質 中等',
                low: '品質 快速',
                custom: '品質 自訂'
            },
            quick_print: 'Quick Print',
            scale: '尺寸',
            rotate: '旋轉',
            align_center: '置中',
            delete: '刪除',
            reset: '重設',
            cancel: '取消',
            done: '確認',
            gram: '公克',
            pause: '暫停',
            continue: '繼續',
            restart: '重新開始',
            download_prompt: '請輸入檔案名稱',
            importTitle: '匯入 3D 模型 ( .stl )',
            getFcodeTitle: '儲存FLUX列印工作',
            goTitle: '準備列印',
            deviceTitle: '顯示監控介面',
            rendering: '切片中',
            finishingUp: '完成中',
            savingFilePreview: '產生預覽圖',
            uploading: '讀取中',
            uploaded: '已上傳，分析模型中',
            importingModel: '匯入模型',
            wait: '請稍候',
            out_of_range: '超過列印範圍',
            out_of_range_message: '請縮小物件尺寸'
        },
        laser: {
            import: '匯入',
            save: '儲存⋯',
            custom: '自訂',
            presets: '預設預設',
            acceptable_files: 'JPG, PNG, SVG',
            drop_files_to_import: '拖曳至此以匯入圖片',
            button_advanced: '進階',
            confirm: '確認',
            start_engrave: '雕刻',
            start_cut: '切割',
            close_alert: '關閉',
            get_fcode: '儲存<br/>工作',
            name: '名稱',
            go: 'GO',
            process_caption: '輸出中',
            title: {
                material: 'Select proper material to have the best engraving result.',
                object_height: 'A Raft are layers built under your part and help it stick to the base plate.',
                shading: 'Shading enables gradient effect of laser engraving. It takes longer time.',
                advanced: 'Custom settings for power and speed'
            },
            print_params: {
                object_height: {
                    text: '物體高度',
                    unit: 'mm'
                },
                shading: {
                    text: '漸層',
                    textOn: 'ON',
                    textOff: 'OFF',
                    checked: true
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
                label: '進階選項',
                form: {
                    object_options: {
                        text: '材質',
                        label: '材質選項',
                        options: [
                            {
                                value: 'wood',
                                label: '木板',
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
                save_as_preset_title: '儲存預設',
                load_preset_title: '載入',
                apply: '套用',
                cancel: '取消',
                save: '儲存'
            }
        },
        scan: {
            start_scan: '開始掃瞄',
            stop_scan: '取消',
            over_quota: '超過可容納點雲',
            convert_to_stl: '轉換成 STL',
            scan_again: '再次掃描',
            start_multiscan: '多次掃描',
            processing: '處理中...',
            remaining_time: '剩餘時間',
            elapsed_time: '已用時間',
            do_save: '儲存 STL',
            go: '開始',
            rollback: '返回',
            error: '錯誤',
            confirm: '確認',
            caution: '警告',
            cancel: '取消',
            delete_mesh: '真的要刪除嗎?',
            quality: '品質',
            scan_again_confirm: '是否確定要放棄目前的掃瞄結果？',
            calibrate: '校正',
            calibration_done: {
                caption: '校正完成',
                message: '你可以開始掃描了'
            },
            calibrate_fail: '校正失敗',
            calibration_is_running: '掃描校正中',
            resolution: [{
                id: 'best',
                text: '最佳',
                time: '~60min',
                value: 1200
            },
            {
                id: 'high',
                text: '精細',
                time: '~40min',
                value: 800
            },
            {
                id: 'normal',
                text: '中等',
                time: '~20min',
                value: 400
            },
            {
                id: 'low',
                text: '快速',
                time: '~10min',
                value: 200
            },
            {
                id: 'draft',
                text: '草稿',
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
                filter: '操作',
                position: '位置',
                size: '尺寸',
                rotate: '旋轉',
                crop: '剪裁',
                auto_merge: '自動合併',
                manual_merge: '手動合併',
                clear_noise: '去除噪點'
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
                    caption: '未偵測到鏡頭畫面',
                    message: '壓下，然後拉出掃描鏡頭，直至最底端發出固定聲為止。'
                },
                'no object': {
                    caption: '未偵測到校正工具',
                    message: '請將掃描校正工具插在中心溝槽處'
                },
                'no laser': {
                    caption: '未偵測到掃描雷射',
                    message: '請壓下，並彈出掃描雷射頭。'
                }
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
            camera_on: '啟用鏡頭',
            camera_off: '關閉鏡頭',
            browse_file: '瀏覽檔案',
            pause: '暫停',
            paused: '已暫停',
            pausing: '正在暫停',
            cancelTask: '終止任務',
            selectPrinter: '選擇成型機',
            retry: '重試',
            status: '狀態',
            busy: '忙碌中',
            ready: '待命中',
            reset: '重設(kick)',
            abort: '取消工作',
            start: '開始',
            no_task: '目前無任何工作',
            please_wait: '請稍待...',
            unknown_command: '指令無法在此狀態下被執行',
            quit: '中斷連結',
            heating: '加熱中',
            completing: '完成中',
            aborted: '已終止',
            completed: '已完成',
            calibrating: '校正中',
            starting: '啟動中',
            resuming: '恢復中',
            scanning: '掃描',
            occupied: '裝置被佔用',
            running: '工作中',
            uploading: '上傳中',
            processing: '處理中',
            disconnectedError: {
                caption: '機器連線中斷',
                message: '請確認 %s 的網路連線是否正常'
            },
            noTask: '目前無任何工作',
            pleaseWait: '請稍待...',
            unknownCommand: '指令無法在此狀態下被執行',
            working: '工作中',
            finishing: '完成中',
            initiating: '啟動中',
            unknown: '未知狀態'
        },
        monitor: {
            change_filament                 : 'CHANGE FILLAMENT',
            browse_file                     : 'BROWSE FILE',
            monitor                         : 'MONITOR',
            currentTemperature              : 'Current Temp',
            nothingToPrint                  : 'There is nothing to print',
            go                              : '開始',
            start                           : '開始',
            pause                           : '暫停',
            stop                            : 'STOP',
            record                          : 'RECORD',
            camera                          : 'CAMERA',
            connecting                      : '連線中，請稍候',
            HEAD_OFFLINE                    : '沒有偵測到列印工具頭',
            HEAD_ERROR_CALIBRATING          : '模組校正失誤\n請重新裝載模組，並確認磁鐵關節正確的附著',
            HEAD_ERROR_FAN_FAILURE          : '風扇未轉動\n請用細針戳一下',
            HEAD_ERROR_HEAD_OFFLINE         : '工具頭離線\n請重新插入模組連接線',
            HEAD_ERROR_TYPE_ERROR           : '錯誤模組\n請安裝正確模組',
            'HEAD_ERROR_?'                  : 'Toolhead error\nCheck if the toolhead is abnormal',
            HWARDWARE_ERROR_FILAMENT_RUNOUT : '未偵測到料捲\n請重新插入新的料捲',
            HWARDWARE_ERROR_0               : '未偵測到料捲\n請重新插入新的料捲',
            HARDWARE_ERROR_PLATE_MISSING    : '未偵測到工作平台\n請放上工作平台金屬板',
            HARDWARE_ERROR_ZPROBE_ERROR     : '校正失敗\n請移除列印模組噴頭上的殘料',
            HEAD_ERROR_HEAD_RESET           : '模組傳輸線接觸不良\n請重新裝載模組，並確認傳輸線完整插入',
            CONVERGENCE_FAILED              : '校正失敗\n請移除列印模組噴頭上的殘料',
            HARDWARE_ERROR_HOME_FAILED      : '歸零失敗\n請排除異物，並重新插拔模組連接線',
            HEAD_ERROR_TILT                 : '工具頭傾斜\n請確認球型關節正確附著以繼續',
            HEAD_ERROR_SHAKE                : '工具頭傾斜\n請確認球型關節正確附著以繼續',
            WRONG_HEAD                      : '請更換成列印工具頭',
            USER_OPERATION                  : 'machine operated by (other) user',
            RESOURCE_BUSY                   : '裝置忙碌中\n如果機器沒有在進行動作， 請重新啟動機器',
            DEVICE_ERROR                    : '裝置錯誤\n請重新啟動機器',
            NO_RESPONSE                     : '裝置錯誤\n請重新啟動機器',
            SUBSYSTEM_ERROR                 : '裝置錯誤\n請重新啟動機器',
            HARDWARE_FAILURE                : '裝置錯誤\n請重新啟動機器',
            MAINBOARD_OFFLINE               : '裝置錯誤\n請重新啟動機器',
            HEAD_ERROR_HARDWARE_FAILURE     : '工具模組發生錯誤\n請重新裝載模組，並確認傳輸線完整插入',
            G28_FAILED                      : '歸零失敗\n請排除異物後重試',
            FILAMENT_RUNOUT_0               : '未偵測到料捲\n請重新插入新的料捲',
            processing                      : '處理中',
            savingPreview                   : '產生預覽圖',
            hour                            : '小時',
            minute                          : '分',
            second                          : '秒',
            left                            : '完成',
            temperature                     : '溫度',
            forceStop                       : '是否強制停止現在工作?',
            upload                          : '上傳',
            download                        : '下載',
            fileNotDownloadable             : '下載不支援此檔案格式',
            cannotPreview                   : '無法預覽此檔案',
            extensionNotSupported           : '上傳檔案不支援此檔案格式',
            fileExistContinue               : '檔案已存在，是否要覆蓋？',
            confirmGToF                     : 'GCode 上傳後會轉檔成 FCode, 是否要繼續？',
            task : {
                EXTRUDER                    : '列印工作',
                LASER                       : '雷雕工作'
            },
            device : {
                EXTRUDER                    : '列印模組',
                LASER                       : '雷射模組'
            }
        },
        alert: {
            caption: '錯誤',
            duplicated_preset_name: '重複的預設名稱',
            info: '訊息',
            warning: '警告',
            error: '錯誤',
            retry: '重試',
            abort: '放棄',
            cancel: '取消',
            ok: '確定',
            yes: ' 是',
            no: '否',
            stop: '停止'
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
            connectionTimeout: '連線逾時'
        },
        message: {
            connecting: '連線中...',
            connected: '已連線',
            machineNotConnected: 'Machine is not connected',
            notPrinting: 'Printing is not in progress',
            nothingToPrint: 'Nothing to print (source blob missing)',
            connectionTimeout: '請確認你的網路狀態和 FLUX Device 的 Wi-Fi 指示燈.',
            device_not_found: {
                caption: '找不到預設裝置',
                message: '請確認預設裝置的 Wi-Fi 指示燈，或取消設定預設裝置'
            },
            device_busy: {
                caption: '裝置忙碌中',
                message: '裝置正在進行另外一項工作，請稍候再試。如果裝置持續沒有回應，請將裝置重新啟動。'
            },
            device_is_used: '裝置正被使用中，是否要終止現在任務？'
        },
        machine_status: {
            '-10': 'Raw Mode',
            '-2': '掃描中',
            '-1': '維護中',
            0: '待命中',
            1: '初始化',
            2: 'ST_TRANSFORM',
            4: 'Starting',
            6: '回復中',
            16: '工作中',
            18: '回復中',
            32: '已暫停',
            36: '已暫停',
            38: '暫停中',
            48: '已暫停',
            50: '暫停中',
            64: '已完成',
            66: '完成中',
            128: '已中斷',
            UNKNOWN: 'UNKNOWN'
        },
        head_module: {
            EXTRUDER: 'Print',
            UNKNOWN: ''
        },
        change_filament: {
            home_caption: '更換料捲',
            load_filament_caption: '自動進料',
            unload_filament_caption: '自動退料',
            cancel: '取消',
            load_filament: '自動進料',
            unload_filament: '自動退料',
            next: '下一步',
            heating_nozzle: '列印模組加熱中',
            unloading: '自動退料中',
            loaded: '進料完成',
            unloaded: '退料完成',
            ok: '確定',
            auto_emerging: '進料中',
            maintain_head_type_error: '列印模組未正確安裝',
            maintain_zombie: '請重新啟動機器'
        },
        input_machine_password: {
            require_password: '"%s" 需要密碼',
            connect: '連接',
            password: '密碼'
        },
        set_default: {
            success: '%s 已設為預設裝置',
            error: '由於網路問題，無法將 %s 設為預設裝置'
        },
        tutorial: {
            set_first_default_caption: '初次使用',
            set_first_default: '是否要將 %s 設為預設裝置?',
            startWithFilament: '首先，讓我們先填裝料捲',
            startWithModel: '接下來，我們來載入3Ｄ模型囉',
            startTour: '嗨，歡迎<br/>這是你第一次使用列印功能,<br/>你希望觀看列印功能教學嗎？',
            clickToImport: '點擊匯入以載入 3D 模型',
            selectQuality: '選擇列印品質',
            clickGo: '按下開始以準備列印',
            startPrint: '在平台上塗上口紅膠，開始列印',
            skip: '跳過教學'
        },
        slicer: {
            computing: '計算中'
        }
    };
});
