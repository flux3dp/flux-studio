define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - zh-tw'
        },
        support: {
            no_webgl: '您的系統不支援 WebGL，建議您使用其他電腦開啟 FLUX Studio'
        },
        device_selection: {
            no_printers: '無法透過 Wi-Fi 偵測到 FLUX Delta，請檢查您與機器的網路連線是否在同個網路下 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215394548">暸解更多</a>',
            device_name: 'DEVICE NAME',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: '版本訊息:',
            firmware: {
                caption: 'FLUX Delta 有新的韌體更新',
                message_pattern_1: '"%s" 有新的韌體更新。',
                message_pattern_2: 'FLUX 韌體 v%s 可使用 - 你的版本為 v%s.',
                latest_firmware: {
                    caption: '韌體更新',
                    message: '韌體已經是最新版本'
                },
                confirm: '上傳',
                upload_file: '韌體上傳',
                update_success: '韌體更新上傳成功',
                update_fail: '更新失敗'
            },
            software: {
                caption: 'FLUX Studio 有新的軟體更新',
                message_pattern_1: 'FLUX Studio 有新的軟體更新。',
                message_pattern_2: 'FLUX Software v%s 可使用 - 你的版本為 v%s.'
            },
            toolhead: {
                caption: 'FLUX 工具頭有新的韌體更新',
                message_pattern_1: '"%s" 有新的韌體更新。',
                message_pattern_2: 'FLUX Toolhead Firmware v%s 可使用',
                latest_firmware: {
                    caption: '韌體更新',
                    message: '韌體已經是最新版本'
                },
                confirm: '上傳',
                upload_file: '韌體上傳',
                update_success: '韌體更新上傳成功',
                update_fail: '更新失敗'
            },
            network_unreachable: '請確認網路連線',
            skip: '跳過此版本',
            later: '稍候',
            install: '下載',
            upload: '上傳'
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
                save_fcode: '匯出工作',
                save_scene: '匯出場景'
            },
            edit: {
                label: '編輯',
                duplicate: '重製',
                rotate: '旋轉',
                scale: '縮放',
                reset: '重置',
                clear: '清除場景',
                undo: '復原'
            },
            device: {
                label: '機器',
                new: '新增機器',
                device_monitor: '儀表板',
                change_filament: '更換線料',
                default_device: '設為預設',
                check_firmware_update: '韌體更新',
                update_delta: 'Delta 韌體',
                update_toolhead: '工具頭韌體'
            },
            window: {
                label: '視窗',
                minimize: '最小化',
                fullscreen: '全螢幕'
            },
            help: {
                label: '說明',
                help_center: '說明中心',
                contact: '聯絡我們',
                troubleshooting: '錯誤排除',
                tutorial: '列印教學',
                debug: '錯誤回報',
                forum: '社群論壇'
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
            back: 'Back',
            retry: 'RETRY',
            no_machine : '目前沒有機器，跳過此步驟',

            // specific caption/content
            invalid_device_name: '機器名稱只能使用中文字，英文字母、數字、空格以及特殊字元  “(”, “)”, “-”, “_”, “’”, “\'”',
            require_device_name: '名稱欄位為必填',
            select_language: '請選擇你想使用的語言',
            change_password: {
                caption: '密碼更改',
                content: '確定要更改密碼嗎?'
            },
            connect_flux: '連接 FLUX Delta',
            via_usb: '使用 USB',
            via_wifi: '使用 WiFi',
            name_your_flux: '為你的 FLUX Delta 取一個獨特的名字',
            wifi_setup: '設定無線網路',
            select_preferred_wifi: '選擇你偏好的網路',
            requires_wifi_password: '需要密碼',
            connecting: '連接中',

            // page specific
            set_machine_generic: {
                printer_name: '機器名稱*',
                printer_name_placeholder: '例如：霹靂五號',
                old_password: '舊密碼',
                password: '機器密碼',
                set_station_mode: '設定成無線基地台',
                password_placeholder: '密碼可以保護你的 FLUX Delta',
                old_password_wrong: '舊密碼錯誤',
                ap_mode_name: '名稱',
                ap_mode_pass: '密碼',
                ap_mode_name_format: '只接受英文及數字',
                ap_mode_pass_format: '請至少輸入8個字'
            },

            setting_completed: {
                start: '開始使用',
                is_ready: '“%s” 準備完成',
                station_ready_statement: '你的 FLUX Delta 已成為 Wi-Fi 熱點，你可以藉由無線連接 “%s” 這個熱點操作 FLUX',
                brilliant: '太棒了!',
                begin_journey: '你可以拔除 Micro USB 傳輸線, 開始使用 FLUX Delta 隨心所欲地進行創作囉！',
                great: '歡迎使用 FLUX Studio',
                upload_via_usb: '你可以稍後再設定 Wi-Fi 選項。<br/>如果你沒有 Wi-Fi 環境，請參考<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215998327-Connection-Guide-for-Desktop-PCs">PC連線指南</a>',
                back: '回到 Wi-Fi 設定',
                ok: '開始使用'
            },

            notice_from_device: {
                headline: '檢查 WiFi 指示燈',
                subtitle: '機器上的綠燈表示了 FLUX Delta 的連線狀態',
                light_on: 'Light On: 綠燈恆亮',
                light_on_desc: 'FLUX Delta 已經連上了指定網路',
                breathing: 'Breathing: 呼吸燈',
                breathing_desc: '無線網路設定失敗，請嘗試重新設定',
                successfully: '如果 FLUX Delta 連線成功',
                successfully_statement: '請將無線網路連線至(%s)，並且重新啟動 FLUX Studio',
                restart: 'Restart FLUX Studio'
            },

            // errors
            errors: {
                error: '錯誤',
                not_found: '無法找到 FLUX Delta',

                keep_connect: {
                    caption: '無法透過 USB 連接',
                    content: '別擔心！請確認電源已被開啟及使用 Micro-Usb 連接機器，並正確安裝驅動程式。<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215327328">瞭解更多</a>'
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
            device: '機器',
            setting: '設定',
            draw: '繪製'
        },
        settings: {
            caption: '設定',
            tabs: {
                general: '一般',
                flux_cloud: 'FLUX Could',
                printer: '成型機'
            },
            ip: '機器 IP 位址',
            wrong_ip_format: 'IP格式錯誤',
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
            },
            notification_on: '開啟',
            notification_off: '關閉'
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
                filament: '線料',
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
                brim: '底部延伸圈數 (Brim)',
                skirts: '邊界預覽 (Skirt)',
                movement: '移動速度',
                structure: '結構速度',
                traveling: '移動',
                surface: '表面速度',
                firstLayer: '底層',
                solidLayers: '實心層',
                innerShell: '外殼內圈',
                outerShell: '外殼外圈',
                bridge: '架橋',
                config: '設定',
                presets: '預設',
                name: '名稱',
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
                advancedTitle: 'Detail 3d printing parameters, you may acheive better result than default by adjusting them',
                confirmExitFcodeMode: '離開預覽模式將會移除Fcode，是否繼續？'
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
            reRendering: '重新切片中',
            finishingUp: '完成中',
            savingFilePreview: '產生預覽圖',
            uploading: '讀取中',
            uploaded: '已上傳，分析模型中',
            importingModel: '匯入模型',
            wait: '請稍候',
            out_of_range: '超過列印範圍',
            out_of_range_message: '請縮小物件尺寸',
            drawingPreview: '繪製預覽路徑，請稍候',
            gettingSlicingReport: '正在取得最新切片狀態'
        },
        draw: {
            pen_up: '移動高度',
            pen_down: '繪製高度',
            speed: '速度',
            pen_up_title: '筆不會碰到繪製表面的 Z 軸距離',
            pen_down_title: '筆會碰到繪製表面的 Z 軸距離, 必須比移動高度低',
            speed_title: '握架工具頭移動的速度',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
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
            laser_accepted_images: '雕刻支援格式：BMP/GIF/JPG/PNG/SVG',
            draw_accepted_images: '繪製支援格式：SVG',
            svg_only: '非 SVG 格式',
            svg_fail_messages: {
                'TEXT_TAG': '不支援標籤 &lt;text&gt;',
                'DEFS_TAG': '不支援標籤 &lt;defs&gt;',
                'CLIP_TAG': '不支援標籤 &lt;clip&gt;',
                'FILTER_TAG': '不支援標籤 &lt;filter&gt;',
                'EMPTY': '內容為空',
                'FAIL_PARSING': '解析錯誤',
                'SVG_BROKEN': '檔案損壞'
            },
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
                                    laser_speed: 3,
                                    power: 255
                                }
                            },
                            {
                                value: 'steel',
                                label: '皮革',
                                data: {
                                    laser_speed: 5,
                                    power: 255
                                }
                            },
                            {
                                value: 'paper',
                                label: '紙',
                                data: {
                                    laser_speed: 2,
                                    power: 255
                                }
                            },
                            {
                                value: 'cork',
                                label: '軟木',
                                data: {
                                    laser_speed: 5,
                                    power: 255
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
            estimating: '估計中...',
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
                clear_noise: '去除噪點',
                save_pointcloud: '輸出點雲'
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
                    caption: '未偵測到鏡頭畫面 / 畫面太暗',
                    message: '壓下，然後拉出掃描鏡頭，直至最底端發出固定聲為止。'
                },
                'no object': {
                    caption: '未偵測到校正工具',
                    message: '請將掃描校正工具插在中心溝槽處，確保光源充足。'
                },
                'no laser': {
                    caption: '未偵測到掃描雷射',
                    message: '請壓下，並彈出掃描雷射頭，確保光源不要過亮。'
                }
            }
        },
        select_printer: {
            choose_printer: '選擇一個成型機',
            notification: '請輸入密碼',
            submit: '送出',
            please_enter_password: '請輸入密碼',
            auth_failure: '認證失敗',
            retry: '重新選擇',
            unable_to_connect: '#008 無法與機器建立穩定連線'
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
            unknown: '未知狀態',
            pausedFromError: '發生錯誤暫停'
        },
        monitor: {
            change_filament                     : 'CHANGE FILLAMENT',
            browse_file                         : 'BROWSE FILE',
            monitor                             : 'MONITOR',
            currentTemperature                  : 'Current Temp',
            nothingToPrint                      : 'There is nothing to print',
            go                                  : '開始',
            start                               : '開始',
            pause                               : '暫停',
            stop                                : '停止',
            record                              : 'RECORD',
            camera                              : '監控',
            connecting                          : '連線中，請稍候',
            HEAD_OFFLINE                        : '#110 沒有偵測到工具頭\n請將工具頭連接線完整插入 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183157">暸解更多</a>',
            HEAD_ERROR_CALIBRATING              : '#112 工具頭校正失誤\n請重新裝載工具頭，並確認磁鐵關節的附著',
            HEAD_ERROR_FAN_FAILURE              : '#113 風扇無法轉動\n請嘗試用細針戳一下 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217732178">暸解更多</a>',
            HEAD_ERROR_HEAD_OFFLINE             : '#110 沒有偵測到工具頭\n請將工具頭連接線完整插入 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183157">暸解更多</a>',
            HEAD_ERROR_TYPE_ERROR               : '#111 偵測到錯誤工具頭\n請安裝正確的對應工具頭',
            HEAD_ERROR_INTLK_TRIG               : '#116 偵測到雕刻工具頭傾斜\n請確認金屬棒正確連結，雕刻頭與握架緊密結合以繼續<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217085937">瞭解更多</a>',
            'HEAD_ERROR_?'                      : '#199 Toolhead error\nCheck if the toolhead is abnormal',
            HARDWARE_ERROR_FILAMENT_RUNOUT      : '#121 沒有偵測到線料\n請重新插入新的線料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">瞭解更多</a>',
            HARDWARE_ERROR_0                    : '#121 沒有偵測到線料\n請重新插入新的線料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">瞭解更多</a>',
            HARDWARE_ERROR_PLATE_MISSING        : '#122 沒有偵測到工作平台\n請放上工作平台金屬板',
            HARDWARE_ERROR_ZPROBE_ERROR         : '#123 水平校正失敗\n請移除可能影響校正的物體（噴嘴殘料、工作平台上雜質）<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931767">暸解更多</a>',
            HEAD_ERROR_RESET                    : '#114 工具頭傳輸線接觸不良\n請確認傳輸線完整插入以繼續 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183167">暸解更多</a>',
            HARDWARE_ERROR_CONVERGENCE_FAILED   : '#123 水平校正失敗\n請移除可能影響校正的物體（噴嘴殘料、工作平台上雜質）<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931767">暸解更多</a>',
            HARDWARE_ERROR_HOME_FAILED          : '#124 原點校正失敗\n請排除軌道上異物，並重新插拔工具頭連接線 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931807">暸解更多</a>',
            HEAD_ERROR_TILT                     : '#162 偵測到工具頭傾斜\n請確認球型關節正確附著以繼續',
            HEAD_ERROR_SHAKE                    : '#162 偵測到工具頭傾斜\n請確認球型關節正確附著以繼續',
            WRONG_HEAD                          : '請更換成列印工具頭',
            USER_OPERATION                      : '別的使用者正在佔用機器',
            RESOURCE_BUSY                       : '機器忙碌中\n如果機器沒有在進行動作， 請重新啟動機器',
            DEVICE_ERROR                        : '裝置錯誤\n請重新啟動機器',
            NO_RESPONSE                         : '裝置錯誤\n請重新啟動機器',
            SUBSYSTEM_ERROR                     : '裝置錯誤\n請重新啟動機器',
            HARDWARE_FAILURE                    : '裝置錯誤\n請重新啟動機器',
            MAINBOARD_OFFLINE                   : '裝置錯誤\n請重新啟動機器',
            HEAD_ERROR_HARDWARE_FAILURE         : '#164 工具頭溫度異常\n請聯繫 FLUX 客服<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218415378">暸解更多</a>',
            G28_FAILED                          : '#124 原點校正失敗\n請排除軌道上異物，並重新插拔工具頭連接線 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931807">暸解更多</a>',
            FILAMENT_RUNOUT_0                   : '#121 沒有偵測到線料\n請重新插入新的線料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">瞭解更多</a>',
            processing                          : '處理中',
            savingPreview                       : '正在產生預覽圖',
            hour                                : '小時',
            minute                              : '分',
            second                              : '秒',
            left                                : '完成',
            temperature                         : '溫度',
            forceStop                           : '是否強制停止現在工作?',
            upload                              : '上傳',
            download                            : '下載',
            fileNotDownloadable                 : '下載不支援此檔案格式',
            cannotPreview                       : '無法預覽此檔案',
            extensionNotSupported               : '上傳檔案不支援此檔案格式',
            fileExistContinue                   : '檔案已存在，是否要覆蓋？',
            confirmGToF                         : 'GCode 上傳後會自動轉檔成 FCode，是否繼續？',
            updatePrintPresetSetting            : 'FLUX STUDIO 有新的預設列印參數。\n是否要更新？（會刪除目前參數）',
            confirmFileDelete                   : '是否確定要刪除這個檔案？',
            task: {
                EXTRUDER                        : '列印工作',
                LASER                           : '雕刻工作',
                DRAW                            : '繪製工作'
            },
            device: {
                EXTRUDER                        : '列印工具頭',
                LASER                           : '雕刻工具頭',
                DRAW                            : '繪製工具頭'
            },
            cant_get_toolhead_version           : '無法取得最新版本資訊'
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
            close: '關閉',
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
            connectionTimeout: '請確認你的網路狀態和 FLUX Delta 的 Wi-Fi 指示燈是否為恆亮',
            device_not_found: {
                caption: '找不到預設機器',
                message: '請確認預設機器的 Wi-Fi 指示燈，或取消設定預設裝置'
            },
            device_busy: {
                caption: '機器忙碌中',
                message: '機器正在進行另外一項工作，請稍候再試。如果裝置持續沒有回應，請將裝置重新啟動。'
            },
            device_is_used: '機器正被使用中，是否要終止現在任務？',
            invalidFile: '檔案不是正確的 STL 格式',
            failGeneratingPreview: '無法儲存預覽圖',
            slicingFailed: 'slic3r 無法型成可列印的 model',
            no_password: {
                content: '請用 USB 設定機器密碼，以提供此台電腦連線',
                caption: '未設定密碼'
            },
            gCodeAreaTooBigCaption: '工作路徑超過列印範圍',
            gCodeAreaTooBigMessage: '請縮小物體尺寸、關閉底座、底部延伸圈數或是邊界預覽',
            image_is_too_small: '圖檔內容有誤',
            monitor_too_old: {
                caption: '韌體需要更新',
                content: '請按照<a target="_blank" href="http://helpcenter.flux3dp.com/hc/zh-tw/articles/216251077">此說明</a>安裝最新韌體版本'
            },
            cant_establish_connection: '無法正常啟動 FLUX Studio API，並<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/requests/new" target="_blank">聯繫 FLUX 客服</a>',
            application_occurs_error: '應用程式發生錯誤，請使用功能表 > 說明 > 錯誤回報',
            error_log: '錯誤訊息',
            fcodeForLaser: '檔案為雕刻工作',
            fcodeForPen: '檔案為繪圖工作',
            confirmFCodeImport: '載入.fc檔案將清除目前所有場景，是否繼續？',
            confirmSceneImport: '載入.fsc檔案將清除目前所有場景，是否繼續？',
            brokenFcode: '無法開啟 %s',
            slicingFatalError: '切片時發生錯誤，請上傳模型檔案給 FLUX 客服',
            unknown_error: '連接時發生未知錯誤，請使用功能表 > 說明 > 錯誤回報',
            important_update: {
                caption: '重要更新',
                message: 'Delta 有重要韌體更新，是否要現在更新？',
            }
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
            home_caption: '更換線料',
            load_filament_caption: '自動進料',
            unload_filament_caption: '自動退料',
            cancel: '取消',
            load_filament: '自動進料',
            unload_filament: '自動退料',
            next: '下一步',
            heating_nozzle: '列印工具頭加熱中',
            unloading: '自動退料中',
            loaded: '進料完成',
            unloaded: '退料完成',
            ok: '確定',
            auto_emerging: '請插入線料',
            maintain_head_type_error: '列印工具頭未正確安裝',
            maintain_zombie: '請重新啟動機器',
            toolhead_no_response: '#117 列印模組沒有回應 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218347477">暸解更多</a>'
        },
        input_machine_password: {
            require_password: '"%s" 需要密碼',
            connect: '連接',
            password: '密碼'
        },
        set_default: {
            success: '%s 已設為預設機器',
            error: '由於網路問題，無法將 %s 設為預設機器'
        },
        tutorial: {
            set_first_default_caption: '歡迎使用',
            set_first_default: '是否要將 %s 設為預設機器?',
            startWithFilament: '首先，讓我們先填裝線料',
            startWithModel: '接下來，讓我們載入範例3Ｄ模型',
            startTour: '嗨，歡迎<br/>這是你第一次使用列印功能,<br/>你希望觀看列印功能教學嗎？',
            clickToImport: '點擊匯入以載入 3D 模型',
            selectQuality: '選擇列印品質',
            clickGo: '按下開始以準備列印',
            startPrint: '確定平台上沒有格線，並於平台上塗上足厚口紅膠待其乾燥，即可開始列印',
            skip: '跳過教學'
        },
        slicer: {
            computing: '計算中'
        }
    };
});
