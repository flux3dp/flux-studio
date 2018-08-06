define(function() {


    return {
        general: {
            wait: '处理中，请稍待'
        },
        buttons: {
            next: '下一步'
        },
        support: {
            no_webgl: '您的系统不支援 WebGL，建议您使用其他电脑开启 FLUX Studio',
            no_vcredist: '请安装 Visual C++ Redistributable 2015<br/>可以在flux3dp.com找到',
            osx_10_9: 'FLUX Studio 目前不支援 OS X 10.9，敬请更新至更新的版本。'
        },
        generic_error: {
            UNKNOWN_ERROR: '[UE] 请重启 FLUX Studio',
            OPERATION_ERROR: '[OE] 机器发生状态冲突，请再试一次',
            SUBSYSTEM_ERROR: '[SE] 请重启机器',
            UNKNOWN_COMMAND: '[UC] 请更新机器韧体',
            RESOURCE_BUSY: '[RB] 请重新启动 Delta, 或再试一次'
        },
        device_selection: {
            no_printers: '无法透过 Wi-Fi 侦测到机器，请检查您与机器的网路连线是否在同个网路下 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215394548">暸解更多</a>',
            no_beambox: '无法透过 Wi-Fi 侦测到机器，请检查您与机器的网路连线是否在同个网路下 <a target="_blank" href="https://tw.flux3dp.com/beambox-tutorial/">暸解更多</a>',
            module: 'MODULE',
            status: 'STATUS'
        },
        update: {
            release_note: '版本讯息:',
            firmware: {
                caption: '有新的机器韧体更新',
                message_pattern_1: '"%s" 有新的韧体更新。',
                message_pattern_2: '%s 韧体 v%s 可使用 - 你的版本为 v%s.',
                latest_firmware: {
                    caption: '韧体更新',
                    message: '韧体已经是最新版本',
                    still_update: '档案更新'
                },
                confirm: '上传',
                upload_file: '韧体上传',
                update_success: '韧体更新上传成功',
                update_fail: '更新失败'
            },
            software: {
                caption: 'FLUX Studio 有新的软体更新',
                message_pattern_1: 'FLUX Studio 有新的软体更新。',
                message_pattern_2: 'FLUX Software v%s 可使用 - 你的版本为 v%s.'
            },
            toolhead: {
                caption: 'FLUX 工具头有新的韧体更新',
                message_pattern_1: '"%s" 有新的韧体更新。',
                message_pattern_2: 'FLUX Toolhead Firmware v%s 可使用',
                latest_firmware: {
                    caption: '韧体更新',
                    message: '韧体已经是最新版本'
                },
                confirm: '上传',
                upload_file: '韧体上传',
                update_success: '韧体更新上传成功',
                update_fail: '更新失败',
                waiting: '请确认已安装工具头'
            },
            updating: '更新中...',
            skip: '跳过此版本',
            checkingHeadinfo: '检查工具头资讯',
            preparing: '准备中...',
            later: '稍候',
            download: '线上更新',
            cannot_reach_internet: '伺服器无法连接<br/>请确认网路连线',
            install: '下载',
            upload: '上传'
        },
        topmenu: {
            version: '版本',
            sure_to_quit: '确定要结束 FLUX Studio?',
            flux: {
                label: 'Flux',
                about: '关于 FLUX studio',
                preferences: '偏好设定',
                quit: '结束'
            },
            file: {
                label: '档案',
                import: '汇入',
                save_fcode: '汇出工作',
                save_scene: '汇出场景',
                confirmReset: '是否确定要重置所有设定?'
            },
            edit: {
                label: '编辑',
                duplicate: '重制',
                rotate: '旋转',
                scale: '缩放',
                clear: '清除场景',
                undo: '复原',
                alignCenter: '置中',
                reset: '重设'
            },
            device: {
                label: '机器',
                new: '新增或设定机器',
                device_monitor: '仪表板',
                device_info: '机器资讯',
                head_info: '工具头资讯',
                change_filament: '更换线料',
                default_device: '设为预设',
                check_firmware_update: '韧体更新',
                update_delta: '机器韧体',
                update_toolhead: '工具头韧体',
                calibrate: '校正平台',
                set_to_origin: '回归原点',
                movement_tests: '执行运动测试',
                scan_laser_calibrate: '打开扫描雷射',
                clean_calibration: '校正平台（清除原始资料）',
                commands: '指令',
                set_to_origin_complete: '机器已回归原点',
                scan_laser_complete: '扫描雷射已开启，点击 "完成" 以关闭雷射',
                movement_tests_complete: '运动测试完成',
                movement_tests_failed: '运动测试失败。<br/>1. 请确工具头连接线被正确拉直<br/>2. 上盖工具头连接线接头没入约一半<br/>3. 可尝试将工具头连接线顺时针或逆时针旋转 180 度再插入<br/>4. 参考 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/115003674128">此篇文章</a>',
                download_log: '汇出机器日志',
                download_log_canceled: '取消日志下载',
                download_log_error: '不明错误发生，请稍候再试一次',
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
                finish: '完成',
                cancel: '取消',
                turn_on_head_temperature: '设定列印工具头温度'
            },
            window: {
                label: '视窗',
                minimize: '最小化',
                fullscreen: '全荧幕'
            },
            help: {
                label: '说明',
                help_center: '说明中心',
                contact: '联络我们',
                tutorial: '列印教学',
                software_update: '软体更新',
                debug: '错误回报',
                forum: '社群论坛'
            },
            account: {
                label: '帐号',
                sign_in: '登入',
                sign_out: '登出'
            }
        },
        initialize: {
            // generic strings
            next: '下一步',
            start: '开始设定',
            skip: '跳过',
            cancel: '取消',
            confirm: '确认',
            connect: '连接',
            back: '返回',
            retry: '重试',
            no_machine : '目前没有机器或已设定过连线，跳过此步骤',

            // specific caption/content
            invalid_device_name: '机器名称只能使用中文，英文、数字、空格以及特殊字元 ( ) - _ ’ \'',
            require_device_name: '名称栏位为必填',
            select_language: '请选择你想使用的语言',
            change_password: {
                caption: '密码更改',
                content: '确定要更改密码吗?'
            },
            connect_flux: '连接机器',
            via_usb: '使用 USB',
            via_wifi: '使用 WiFi',
            select_machine_type: '请选择您的机种',
            name_your_flux: '为你的机器取一个独特的名字',
            wifi_setup: '设定无线网路',
            select_preferred_wifi: '选择你偏好的网路',
            requires_wifi_password: '需要密码',
            connecting: '连接中',

            // page specific
            connect_beambox: {
                set_beambox_connection: '设定手机切膜机连线',
                please_goto_touchpad: '请使用手机切膜机触控面板进行 WiFi 连线绑定',
                tutorial: '1. 点选触控面板 "设定" > "网际网路" > "设定"\n2. 选取欲绑定的 WiFi 名称并输入密码\n3. 稍待10秒，若于 "设定" > "网际网路" 成功显示无线网路 IP，即代表绑定成功\n4. 请将此无线网路 IP 输入至 "主选单" > "偏好设定" > "机器 IP 位址"，以确保不论您使用哪一种路由器，都能顺利连线',
                please_see_tutorial_video: '观看教学影片',
                tutorial_url: 'https://tw.flux3dp.com/beambox-tutorial/'
            },

            set_machine_generic: {
                printer_name: '机器名称*',
                printer_name_placeholder: '例如：霹雳五号',
                old_password: '旧密码',
                password: '机器密码',
                set_station_mode: '设定成无线基地台',
                password_placeholder: '使用密码保护你的机器',
                incorrect_old_password: '旧密码错误',
                incorrect_password: '密码错误',
                ap_mode_name: '网路名称',
                ap_mode_pass: '密码',
                ap_mode_name_format: '只接受英文及数字',
                ap_mode_pass_format: '请至少输入 8 个字',
                ap_mode_name_placeholder: '最多 32 个字',
                ap_mode_pass_placeholder: '至少 8 个字',
                create_network: '建立网路',
                join_network: '加入网路',
                security: '安全层级'
            },

            setting_completed: {
                start: '开始使用',
                is_ready: '“%s” 准备完成',
                station_ready_statement: '你的机器已成为 Wi-Fi 热点，你可以借由无线连接 “%s” 这个热点操作 FLUX',
                brilliant: '太棒了!',
                begin_journey: '你可以拔除 USB / Micro USB 传输线, 开始使用机器随心所欲地进行创作啰！',
                great: '欢迎使用 FLUX Studio',
                upload_via_usb: '你可以稍后再设定 Wi-Fi 选项。<br/>如果你没有 Wi-Fi 环境，请参考<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215998327-Connection-Guide-for-Desktop-PCs">PC连线指南</a>',
                back: '回到 Wi-Fi 设定',
                ok: '开始使用'
            },

            notice_from_device: {
                headline: '检查 WiFi 指示灯',
                subtitle: '机器上的绿灯表示了机器的连线状态',
                light_on: 'Light On: 绿灯恒亮',
                light_on_desc: '机器已经连上了指定网路',
                breathing: 'Breathing: 呼吸灯',
                breathing_desc: '无线网路设定失败，请尝试重新设定',
                successfully: '如果机器连线成功',
                successfully_statement: '请将无线网路连线至(%s)，并且重新启动 FLUX Studio',
                restart: '重启 FLUX Studio'
            },

            // errors
            errors: {
                error: '错误',
                close: '关闭',
                not_found: '无法找到机器',
                not_support: '请透过随身碟更新 Delta 韧体到 v1.6 以上',

                keep_connect: {
                    caption: '无法透过 USB 连接',
                    content: '别担心！请确认\n1. WiFi 指示灯（绿灯）呼吸、闪烁或恒亮\n2. 装置管理员有 FLUX Link Cable，可查看 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/215327328">说明</a>\n3. 重新插拔线并稍等 10 秒钟'
                },

                wifi_connection: {
                    caption: '无法与此 Wi-Fi 连线',
                    connecting_fail: '请确认信号强度以及密码正确'
                },

                select_wifi: {
                    ap_mode_fail: '基地台模式连线设定失败'
                }
            }
        },
        wifi: {
            home: {
                line1: '请问你所处的环境拥有可以连线的 Wi-Fi 吗?',
                line2: '我们将协助你将 FLUX 连线至你家中的 Wi-Fi',
                select: '是的，开始连线'
            },
            set_password: {
                line1: '请输入“',
                line2: '”无线网路的连线密码',
                password_placeholder: '请输入 Wi-Fi 密码',
                back: '上一步',
                join: '加入',
                connecting: '连线中'
            },
            success: {
                caption: '太棒了，连线成功!',
                line1: '接下来，我们将为你的机器做一些简单的设定。',
                next: '下一步'
            },
            failure: {
                caption: '连线失败',
                line1: '请确认你的 Wi-Fi 是否正常运作后，再重新连线',
                next: '重新连线'
            },
            set_printer: {
                caption: '为你的 FLUX3D Printer 设定名称与密码',
                printer_name: '名称',
                printer_name_placeholder: '设定名称',
                password: '密码',
                password_placeholder: '设定密码',
                notice: '设定密码，可以确保你的 FLUX 只有知道密码的人可以操作',
                next: '下一步'
            }
        },
        menu: {
            print: '列印',
            laser: '雷雕',
            scan: '扫描',
            usb: 'USB',
            device: '机器',
            setting: '设定',
            draw: '绘图',
            cut: '切割',
            beambox: 'BEAMBOX',
            mill: 'MILL'
        },
        settings: {
            on: '开',
            off: '关',
            caption: '设定',
            tabs: {
                general: '一般',
                device: '机器'
            },
            ip: '机器 IP 位址',
            wrong_ip_format: 'IP格式错误',
            projection: '视角投影',
            projection_perspective: '透视投影',
            projection_orthographic: '正投影',
            antialiasing: '反锯齿',
            auto_slice: '自动切片',
            lock_selection: '锁定选取目标',
            reset: '重置所有设定',
            default_machine: '预设机器',
            default_machine_button: '无',
            remove_default_machine_button: '删除',
            confirm_remove_default: '将会删除预设机器',
            reset_now: '重置所有设定',
            confirm_reset: '确认要重置 FLUX Studio?',
            language: '语言',
            notifications: '通知',
            default_app: '预设功能',
            delta_series: 'Delta 系列',
            beambox_series: 'Beambox 系列',
            default_model: '预设型号（列印参数）',
            default_beambox_model: '预设型号',
            guides_origin: '参考线座标',
            guides: '参考线',
            fd1: 'FLUX Delta',
            fd1p: 'FLUX Delta+',
            none: '无',
            close: '关闭',
            printer: {
                new_printer: '新增成型机',
                name: '成型机名称',
                current_password: '目前密码',
                set_password: '设定密码',
                security_notice: '你可以用密码保护你的成型机',
                connected_wi_fi: 'Wi-Fi 连线',
                advanced: '进阶',
                join_other_network: '加入其它网路',
                your_password: '新密码',
                confirm_password: '确认密码',
                save_password: '储存变更'
            },
            cancel: '取消',
            done: '完成',
            connect_printer: {
                title: '选择连接成型机'
            },
            notification_on: '开启',
            notification_off: '关闭',
            engine_change_fail: {
                'caption': '无法变更切片引擎',
                '1': '检查时发生错误',
                '2': 'cura 版本错误',
                '3': '路径不是 Cura',
                '4': 'path is not a exist file, please check engine path in setting section'
            },
            allow_tracking: '您是否愿意自动传送匿名用量资料，协助 FLUX 改进产品和服务？',
            flux_cloud: {
                processing: '处理中...',
                flux_cloud: 'FLUX CLOUD',
                back: '返回',
                next: '下一步',
                done: '结束',
                sign_in: '登入',
                sign_up: '注册',
                success: '成功',
                fail: '失败',
                cancel: '取消',
                try_again: '再试一次',
                bind: '绑定',
                bind_another: '绑定另一部机器',
                username: '使用者名称',
                nickname: '使用者别名',
                email: '电子信箱',
                phone: '手机号',
                password: '密码',
                re_enter_password: '重新输入密码',
                forgot_password: '忘记密码?',
                sign_up_statement: '如果尚未持有FLUX ID，可以<a href="%s">按此注册</a>',
                try_sign_up_again: '请重新<a href="%s">注册</a>',
                agreement: '同意 FLUX-Cloud <a href="#/studio/cloud/privacy">隐私权政策</a>, <a href="#/studio/cloud/terms">使用条款</a>',
                pleaseSignIn: '请使用 FLUX ID 登入',
                enter_email: '请输入您的电子信箱',
                check_inbox: '请至您的电子信箱确认!',
                error_blank_username: '请输入使用者别名',
                error_blank_email: '请输入电子信箱',
                error_email_format: '请输入正确的电子信箱',
                error_email_used: '此电子信箱已被使用',
                error_password_not_match: '确认密码与密码不相同',
                select_to_bind: '请选择欲绑定的机器',
                binding_success: '绑定成功!',
                binding_success_description: '您可以开始使用 FLUX App 来监控机器',
                binding_fail: '绑定失败',
                binding_fail_description: '网路可能有问题，请再试一次',
                binding_error_description: '无法开启云端功能，请与客服人员联络，并附上机器错误记录',
                retrieve_error_log: '下载错误记录',
                binding: '绑定中...',
                check_email: '相关信进已寄出到您的电子信箱，请确认',
                email_exists: '电子信箱已被使用',
                not_verified: '请于您的电子信箱开启确认信件',
                user_not_found: '使用者帐号密码错误',
                resend_verification: '重新寄送确认信件',
                contact_us: '请与 FLUX 客服联络',
                confirm_reset_password: '需要重新设定密码吗？',
                format_error: '登入失败，请重新登入',
                agree_to_terms: '请同意使用者条款',
                back_to_list: '回机器列表',
                change_password: '密码变更',
                current_password: '目前登入密码',
                new_password: '新密码',
                confirm_password: '确认新密码',
                empty_password_warning: '密码不可为空白',
                WRONG_OLD_PASSWORD: '旧密码错误',
                FORMAT_ERROR: '密码格式错误',
                submit: '储存',
                sign_out: '登出',
                not_supported_firmware: '支援 FLUX cloud 需要机器韧体 v1.5＋',
                unbind_device: '确认要不再绑定此机器?',
                CLOUD_UNKNOWN_ERROR: '机器无法连接到云端伺服器. 请重新启动机器. (General)',
                CLOUD_SESSION_CONNECTION_ERROR: '机器无法连接到云端伺服器. 请重新启动机器. (Session)',
                SERVER_INTERNAL_ERROR: '伺服器发生错误，请稍后再试.',
            }
        },
        print: {
            import: '汇入',
            save: '储存…',
            gram: '克',
            support_view: '支援预览',
            start_print: '列印',
            advanced: {
                general: '一般',
                layers: '切层',
                infill: '填充',
                support: '支撑',
                speed: '速度',
                custom: '文字',
                slicingEngine: '切片引擎',
                slic3r: 'Slic3r',
                cura: 'Cura',
                cura2: 'Cura2',
                filament: '线料',
                temperature: '温度与材料',
                detect_filament_runout: '侦测线料',
                flux_calibration: '自动校正',
                detect_head_tilt: '侦测工具头倾斜',
                layer_height_title: '层高',
                layer_height: '一般层高',
                firstLayerHeight: '底层层高',
                shell: '物件外壳',
                shellSurface: '物件外壳圈数',
                solidLayerTop: '顶部实心层数',
                solidLayerBottom: '底部实心层数',
                density: '填充密度',
                pattern: '填充图样',
                auto: 'auto',                       // do not change
                line: '线状',                       // do not change
                rectilinear: '直线',         // do not change
                rectilinearGrid: '直线格状',// do not change
                honeycomb: '蜂巢状',             // do not change
                offset: '位移',
                xyOffset: '水平扩张',
                zOffset: 'Z 轴位移',
                cutBottom: '移除底部',

                curaInfill: {
                    automatic: '自动',
                    grid: '格状',
                    lines: '线状',
                    concentric: '同心',
                    concentric_3d: '立体同心',
                    cubic: '立方',
                    cubicsubdiv: '立方细分',
                    tetrahedral: '四面体',
                    triangles: '三角形',
                    zigzag: '锯齿'
                },
                curaSupport: {
                    lines: '线状',
                    grid: '格状',
                    zigzag: '锯齿'
                },
                blackMagic: '黑魔法',
                spiral: '螺旋',
                generalSupport: '支撑',
                spacing: '线段间隔',
                overhang: '悬空角度',
                zDistance: 'Z轴间隔',
                raft: '底座',
                raftLayers: '底座层数',
                brim: '底部延伸圈数 (Brim)',
                skirts: '边界预览 (Skirt)',
                movement: '移动速度',
                structure: '结构速度',
                traveling: '移动',
                surface: '表面速度',
                firstLayer: '底层',
                solidLayers: '实心层',
                innerShell: '外壳内圈',
                outerShell: '外壳外圈',
                bridge: '架桥',
                config: '设定',
                presets: '预设',
                name: '名称',
                apply: '套用',
                save: '储存',
                saveAsPreset: '储存参数',
                cancel: '取消',
                delete: '删除',
                loadPreset: '载入参数',
                savePreset: '储存参数',
                reloadPreset: '重置参数',
                printing: '列印温度',
                firstLayerTemperature: '首层温度',
                flexibleMaterial: '软性材料'
            },
            mode: [
                {
                    value: 'beginner',
                    label: '入门',
                    checked: true
                },
                {
                    value: 'expert',
                    label: '专家'
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
                        text: '材质',
                        options: [
                            {
                                value: 'pla',
                                label: 'PLA',
                                selected: true
                            }
                        ]
                    },
                    support: {
                        text: '支撑',
                        on: '支撑',
                        off: '关闭',
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
                                label: '垫片',
                                selected: true
                            }
                        ]
                    }
                },
                expert: {
                    layer_height: {
                        text: '每层高度',
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
                support_on: '支撑 ON',
                support_off: '支撑 OFF',
                advanced: '更多选项',
                preview: '预览路径',
                plaTitle: 'PICK THE COLOR OF THE FILAMENT',
                transparent: 'TRANSPARENT',
                raftTitle: 'A Raft are layers built under your part and help it stick to the base plate',
                supportTitle: 'A Support is a generated structure to support overhanging part of your object, to prevent filament dropping',
                advancedTitle: 'Detail 3d printing parameters, you may acheive better result than default by adjusting them',
                confirmExitFcodeMode: '离开预览模式将会移除Fcode，是否继续？'
            },
            right_panel: {
                get: 'Get',
                go: 'Go',
                preview: '预览'
            },
            quality: {
                high: '品质 精细',
                med: '品质 中等',
                low: '品质 快速',
                custom: '品质 自订'
            },
            model: {
                fd1: 'Delta',
                fd1p: 'Delta+'
            },
            scale: '尺寸',
            rotate: '旋转',
            delete: '删除',
            reset: '重设',
            cancel: '取消',
            done: '确认',
            pause: '暂停',
            restart: '重新开始',
            download_prompt: '请输入档案名称',
            importTitle: '汇入 3D 模型 ( .stl )',
            getFcodeTitle: '储存FLUX列印工作',
            goTitle: '准备列印',
            deviceTitle: '显示监控介面',
            rendering: '切片中',
            reRendering: '重新切片中',
            finishingUp: '完成中',
            savingFilePreview: '产生预览图',
            uploading: '读取中',
            uploaded: '已上传，分析模型中',
            importingModel: '汇入模型',
            wait: '请稍候',
            out_of_range: '超过列印范围',
            out_of_range_message: '请缩小物件尺寸',
            drawingPreview: '绘制预览路径，请稍候',
            gettingSlicingReport: '正在取得最新切片状态'
        },
        draw: {
            pen_up: '移动高度',
            pen_down: '绘制高度',
            speed: '速度',
            pen_up_title: '笔不会碰到绘制表面的 Z 轴距离',
            pen_down_title: '笔会碰到绘制表面的 Z 轴距离, 必须比移动高度低',
            speed_title: '握架工具头移动的速度',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
        },
        cut: {
            horizontal_calibrate: '水平\n校正',
            height_calibrate: '高度\n校正',
            running_horizontal_adjustment: '水平校正中',
            running_height_adjustment: '高度校正中',
            run_height_adjustment: '请调整刀具，并执行高度校正。',
            horizontal_adjustment_completed: '水平校正完成',
            height_adjustment_completed: '高度校正完成',
            you_can_now_cut: '恭喜您！您可以开始进行切割工作',
            zOffset: '高度调整',
            overcut: '闭环过切',
            speed: '速度',
            bladeRadius: '刀尖半径',
            backlash: 'Backlash 补偿',
            zOffsetTip: '刀头模组底部距离切割平面的高度调整',
            overcutTip: '当切割路径起始点与结束点座标相同时，切到结束点后再走一些从起始点开始的路径',
            speedTip: '切割速度',
            backlashTip: '如果使用第三方刀具直线不够直，则调整此参数',
            units: {
                mms: 'mm/s',
                mm: 'mm'
            }
        },
        laser: {
            import: '汇入',
            save: '储存…',
            custom: '自订',
            presets: '预设',
            button_advanced: '进阶',
            confirm: '确认',
            get_fcode: '储存<br/>工作',
            export_fcode: '储存成工作档案 ...',
            name: '名称',
            go: 'GO',
            showOutline: '显示<br/>轮廓',
            do_calibrate: '看起来您似乎第一次使用雷射雕刻功能，可以透过包装里附的牛皮卡找到最佳的焦距，是否要载入焦距校正图片？（稍后亦可以于进阶面板中载入）',
            process_caption: '输出中',
            laser_accepted_images: '雕刻支援格式：BMP/GIF/JPG/PNG/SVG',
            draw_accepted_images: '绘制支援格式：SVG',
            svg_fail_messages: {
                'TEXT_TAG': '不支援标签 &lt;text&gt;',
                'DEFS_TAG': '不支援标签 &lt;defs&gt;',
                'CLIP_TAG': '不支援标签 &lt;clip&gt;',
                'FILTER_TAG': '不支援标签 &lt;filter&gt;',
                'EMPTY': '内容为空',
                'FAIL_PARSING': '解析错误',
                'SVG_BROKEN': '档案损坏',
                'NOT_SUPPORT': '非 SVG 格式'
            },
            title: {
                material: '选择正确的材质来雕刻出最好的结果',
                object_height: '物体高度，从底盘到物件最高点之距离',
                height_offset: '雷射高度调整，包含磁吸底版跟焦距误差，可根据焦距校正图片调整数字',
                shading: '使用雷射渐层效果，会增加雕刻时间',
                advanced: '自行调整功率大小以及速度'
            },
            print_params: {
                object_height: {
                    text: '物体高度',
                    unit: 'mm'
                },
                height_offset: {
                    text: '焦距调整',
                    unit: 'mm'
                },
                shading: {
                    text: '渐层',
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
                        width: '宽',
                        height: '高'
                    }
                },
                rotate: {
                    text: '旋转'
                },
                threshold: {
                    text: '图片曝光',
                    default: 128
                }
            },
            advanced: {
                label: '进阶选项',
                form: {
                    object_options: {
                        text: '材质',
                        label: '材质选项',
                        options: [
                            {
                                value: 'cardboard',
                                label: '牛皮纸',
                                data: {
                                    laser_speed: 10,
                                    power: 255
                                }
                            },
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
                                label: '纸',
                                data: {
                                    laser_speed: 2,
                                    power: 255
                                }
                            },
                            {
                                value: 'cork',
                                label: '软木',
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
                        min: 0.8,
                        max: 20,
                        step: 0.1
                    },
                    power: {
                        text: '雷射强度',
                        high: '强',
                        low: '弱',
                        min: 0,
                        max: 255,
                        step: 1
                    }
                },
                save_and_apply: '储存并套用',
                save_as_preset: '储存',
                save_as_preset_title: '储存预设',
                load_preset_title: '载入',
                background: '自订背景',
                removeBackground: '移除背景',
                removePreset: '设定值将会移除',
                load_calibrate_image: '载入校正图片',
                apply: '套用',
                cancel: '取消',
                save: '储存'
            }
        },
        scan: {
            stop_scan: '取消',
            over_quota: '超过可容纳点云',
            convert_to_stl: '转换成 STL',
            scan_again: '再次扫描',
            start_multiscan: '多次扫描',
            processing: '处理中...',
            remaining_time: '剩余时间',
            do_save: '储存 STL',
            go: '开始',
            rollback: '返回',
            error: '错误',
            confirm: '确认',
            caution: '警告',
            cancel: '取消',
            delete_mesh: '真的要删除吗?',
            quality: '品质',
            scan_again_confirm: '是否确定要放弃目前的扫瞄结果？',
            calibrate: '校正',
            calibration_done: {
                caption: '校正完成',
                message: '你可以开始扫描了'
            },
            cant_undo: '无法复原',
            estimating: '估计中...',
            calibrate_fail: '校正失败',
            calibration_is_running: '扫描校正中',
            calibration_firmware_requirement: '请更新至韧体以使用此功能 (1.6.25+)',
            resolution: [{
                id: 'best',
                text: '最佳',
                time: '~30分钟',
                value: 1200
            },
            {
                id: 'high',
                text: '精细',
                time: '~20分钟',
                value: 800
            },
            {
                id: 'normal',
                text: '中等',
                time: '~10分钟',
                value: 400
            },
            {
                id: 'low',
                text: '快速',
                time: '~5分钟',
                value: 200
            },
            {
                id: 'draft',
                text: '草稿',
                time: '~2分钟',
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
                rotate: '旋转',
                crop: '剪裁',
                manual_merge: '手动合并',
                clear_noise: '去除噪点',
                save_pointcloud: '输出点云'
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
                    caption: '未侦测到镜头画面 / 画面太暗',
                    message: '压下，然后拉出扫描镜头，直至最底端发出固定声为止。'
                },
                'no object': {
                    caption: '未侦测到校正工具',
                    message: '请将扫描校正工具插在中心沟槽处，确保光源充足。'
                },
                'no laser': {
                    caption: '未侦测到扫描雷射',
                    message: '请压下，并弹出扫描雷射头，确保光源不要过亮。'
                }
            }
        },
        beambox: {
            popup: {
                select_favor_input_device: '为了提供更好的使用者体验<br/>请选择你喜爱的输入装置',
                select_import_method: '选择分层方式:',
                touchpad: '触控板',
                mouse: '滑鼠',
                layer_by_layer: '依图层分层',
                layer_by_color: '依颜色分层',
                nolayer: '不分层',
                no_support_text: 'FLUX Studio 目前不支援由外部汇入文字标签，请由向量绘图软体将文字转成路径后再汇入。',
                power_too_high_damage_laser_tube: '雷射管在高功率下耗损较快，使用低功率可以延长雷试管使用寿命',
                should_update_firmware_to_continue: '您的韧体版本不支援最新的软体改善。为了更良好的使用经验与雕刻品质，请先更新手机切膜机的韧体以继续。 (主选单 > 机器 > [ Your手机切膜机] > 韧体更新)'
            },
            left_panel: {
                insert_object: '插入物件',
                preview: '相机预览',
                advanced: '进阶选项',
                suggest_calibrate_camera_first: '提醒您：\n第一次使用相机，请先进行相机校正。并在每次使用时将平台对焦，以取得最好的效果。',
                end_preview: '结束预览模式',
                unpreviewable_area: '非相机预览范围',
                rectangle: '长方形',
                ellipse: '椭圆形',
                line: '线段',
                image: '图片',
                text: '文字',
                insert_object_submenu: {
                    rectangle: '矩形',
                    ellipse: '椭圆形',
                    line: '线段',
                    image: '图片',
                    text: '文字'
                },
                advanced_panel: {
                    engrave_parameters: '雕刻参数',
                    engrave_dpi: '雕刻解析度',
                    low: '低',
                    medium: '中',
                    high: '高',
                    cancel: '取消',
                    save: '储存'
                }
            },
            right_panel: {
                layer_panel: {
                    layer1: '预设图层',
                    layer_bitmap: '点阵图层'
                },
                laser_panel: {
                    strength: '功率',
                    speed: '速度',
                    repeat: '执行次数',
                    times: '次',
                    cut: '切割',
                    engrave: '雕刻'
                },
            },
            bottom_right_panel: {
                convert_text_to_path_before_export: '部分字型在不同系统间有差异，输出前请将字体转换成路径，以确保文字正确显示。转换文字至路径中...'
            },
            object_panels: {
                position: '位置',
                rotation: '旋转',
                size: '大小',
                width: '宽',
                height: '长',
                center: '圆心',
                ellipse_radius: '大小',
                rounded_corner: '圆角',
                radius: '半径',
                points: '端点',
                text: '文字',
                font_size: '字级',
                fill: '填充',
                letter_spacing: '字距',
                convert_to_path: '转换为路径',
                convert_to_path_to_get_precise_result: '部分字型在不同系统间有差异，输出前请将字体转换成路径，以确保文字正确显示',
                wait_for_parsing_font: '解析字体中... 请稍待 10 秒',
                laser_config: '雷射设定',
                shading: '渐层',
                threshold: '曝光阈值',
                lock_desc: '缩放时固定比例 (SHIFT)'
            },
            svg_editor: {
                unnsupported_file_type: 'FLUX Studio 不直接支援此档案格式。请先输出成图片档或 SVG 格式',
                unnsupport_ai_file_directly: '请先将您的 AI 档输出成 SVG 或 图片档，再汇入至 FLUX Studio'
            },
            units: {
                walt: 'W',
                mm: 'mm'
            }
        },
        select_printer: {
            choose_printer: '请选择要设定的机器',
            notification: '"%s" 需要密码',
            submit: '送出',
            please_enter_password: '"密码',
            auth_failure: '认证失败',
            retry: '重新选择',
            unable_to_connect: '#008 无法与机器建立稳定连线'
        },
        device: {
            pause: '暂停',
            paused: '已暂停',
            pausing: '正在暂停',
            selectPrinter: '选择成型机',
            retry: '重试',
            status: '状态',
            busy: '忙碌中',
            ready: '待命中',
            reset: '重设(kick)',
            abort: '取消工作',
            start: '开始',
            please_wait: '请稍待...',
            quit: '中断连结',
            heating: '加热中',
            completing: '完成中',
            aborted: '已终止',
            completed: '已完成',
            calibrating: '校正中',
            showOutline: '绘制轮廓中',
            aborting: '取消工作中',
            starting: '启动中',
            resuming: '恢复中',
            scanning: '扫描',
            occupied: '机器被占用',
            running: '工作中',
            uploading: '上传中',
            processing: '处理中',
            disconnectedError: {
                caption: '机器连线中断',
                message: '请确认 %s 的网路连线是否正常'
            },
            noTask: '目前无任何工作',
            pleaseWait: '请稍待...',
            finishing: '完成中',
            initiating: '启动中',
            unknown: '未知状态',
            pausedFromError: '发生错误暂停',
            model_name: '型号',
            IP: 'IP',
            serial_number: '序号',
            firmware_version: '韧体版本',
            UUID: 'UUID',
            select: '选择',
            deviceList: '机器列表',
            calibration: {
                title: '自动校正',
                A: '水平与高度',
                H: '高度',
                N: '关闭',
                byFile: '根据 FCODE 设定'
            },
            detectFilament: {
                title: '侦测线料',
                on: '开启',
                off: '关闭',
                byFile: '根据 FCODE 设定'
            },
            filterHeadError: {
                title: '工具头错误侦测',
                shake: '过度摇晃',
                tilt: '倾斜',
                fan_failure: '风扇故障',
                laser_down: '雷射安全锁',
                byFile: '根据 FCODE 设定',
                no: '关闭'
            },
            autoresume: {
                title: '智慧工作恢复',
                on: '开启',
                off: '关闭'
            },
            broadcast: {
                title: 'UPNP 广播',
                L: '预设',
                A: '密集',
                N: '关闭'
            },
            enableCloud: {
                title: '云端操作',
                A: '开启',
                N: '关闭'
            },
            backlash: '路径几何误差补正',
            turn_on_head_temperature: '开启喷头温度',
            plus_camera: '升级包镜头',
            plus_extrusion: '升级包挤出马达',
            movement_test: '列印前运动测试',
            machine_radius: 'Delta机构半径',
            postback_url: '状态回传URL',
            disable: '关闭',
            enable: '开启',
            beambox_should_use_touch_panel_to_adjust: '请至手机切膜机触控面板调整设定。'
        },
        monitor: {
            change_filament                     : 'CHANGE FILLAMENT',
            browse_file                         : 'BROWSE FILE',
            monitor                             : 'MONITOR',
            currentTemperature                  : 'Current Temp',
            nothingToPrint                      : 'There is nothing to print',
            go                                  : '开始',
            start                               : '开始',
            pause                               : '暂停',
            stop                                : '停止',
            record                              : 'RECORD',
            camera                              : '相机',
            connecting                          : '连线中，请稍候',
            HEAD_OFFLINE                        : '#110 没有侦测到工具头\n请确认工具头传输线完整插入 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183157">暸解更多</a>',
            HEAD_ERROR_CALIBRATING              : '#112 工具头校正失误\n请重新装载工具头，并确认磁铁关节的附着',
            HEAD_ERROR_FAN_FAILURE              : '#113 风扇无法转动\n请尝试用细针戳一下 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217732178">暸解更多</a>',
            HEAD_ERROR_HEAD_OFFLINE             : '#110 没有侦测到工具头\n请确认工具头传输线完整插入 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183157">暸解更多</a>',
            HEAD_ERROR_TYPE_ERROR               : '#111 侦测到错误工具头\n请安装正确的对应工具头',
            HEAD_ERROR_INTLK_TRIG               : '#116 侦测到雕刻工具头倾斜\n请确认金属棒正确连结，雕刻头与握架紧密结合以继续<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217085937">了解更多</a>',
            HEAD_ERROR_RESET                    : '#114 工具头传输线接触不良\n请确认工具头传输线完整插入以继续，如持续发生此问题，请联系 FLUX 客服 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218183167">暸解更多</a>',
            HEAD_ERROR_TILT                     : '#162 侦测到工具头倾斜\n请确认球型关节正确附着以继续',
            HEAD_ERROR_SHAKE                    : '#162 侦测到工具头倾斜\n请确认球型关节正确附着以继续',
            HEAD_ERROR_HARDWARE_FAILURE         : '#164 工具头温度异常\n请联系 FLUX 客服<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218415378">暸解更多</a>',
            'HEAD_ERROR_?'                      : '#199 Toolhead error\nCheck if the toolhead is abnormal',
            HARDWARE_ERROR_FILAMENT_RUNOUT      : '#121 没有侦测到线料\n请重新插入新的线料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">了解更多</a>',
            HARDWARE_ERROR_0                    : '#121 没有侦测到线料\n请重新插入新的线料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">了解更多</a>',
            HARDWARE_ERROR_PLATE_MISSING        : '#122 没有侦测到工作平台\n请放上工作平台金属板',
            HARDWARE_ERROR_ZPROBE_ERROR         : '#123 水平校正失败\n请移除可能影响校正的物体（喷嘴残料、工作平台上杂质）<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931767">暸解更多</a>',
            HARDWARE_ERROR_CONVERGENCE_FAILED   : '#123 水平校正失败\n请移除可能影响校正的物体（喷嘴残料、工作平台上杂质）<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931767">暸解更多</a>',
            HARDWARE_ERROR_HOME_FAILED          : '#124 原点校正失败\n请排除轨道上异物，确定传输线不会被夹到 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931807">暸解更多</a>',
            HARDWARE_ERROR_MAINBOARD_ERROR      : '#401 主板没有回应。请联系 FLUX 客服。',
            HARDWARE_ERROR_SUBSYSTEM_ERROR      : '#402 子系统没有回应。请联系 FLUX 客服。',
            HARDWARE_ERROR_SENSOR_ERROR         : '温度侦测器发生问题。请联系 FLUX 客服。',
            HARDWARE_ERROR_SENSOR_ERROR_FSR     : '压力感测晶片读数错误',
            HARDWARE_ERROR_PUMP_ERROR           : '#900 水冷未开，请联系客服 (02) 2651-3171',
            HARDWARE_ERROR_DOOR_OPENED          : '#901 门盖开启，将门盖关上以继续',
            HARDWARE_ERROR_OVER_TEMPERATURE     : '#902 水温过高，请稍后再继续',
            WRONG_HEAD                          : '请更换成列印工具头',
            USER_OPERATION                      : '别的使用者正在占用机器',
            RESOURCE_BUSY                       : '机器忙碌中\n如果机器没有在进行动作， 请重新启动机器',
            DEVICE_ERROR                        : '机器错误\n请重新启动机器',
            NO_RESPONSE                         : '机器错误\n请重新启动机器',
            SUBSYSTEM_ERROR                     : '#402 子系统没有回应。请联系 FLUX 客服。',
            HARDWARE_FAILURE                    : '机器错误\n请重新启动机器',
            MAINBOARD_OFFLINE                   : '机器错误\n请重新启动机器',
            G28_FAILED                          : '#124 原点校正失败\n请排除轨道上异物，并重新插拔工具头连接线 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931807">暸解更多</a>',
            FILAMENT_RUNOUT_0                   : '#121 没有侦测到线料\n请重新插入新的线料 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218931757">了解更多</a>',
            USER_OPERATION_FROM_CODE            : '使用操作暂停（更换线料）',
            processing                          : '处理中',
            savingPreview                       : '正在产生预览图',
            hour                                : '小时',
            minute                              : '分',
            second                              : '秒',
            left                                : '完成',
            temperature                         : '温度',
            forceStop                           : '是否强制停止现在工作?',
            upload                              : '上传',
            download                            : '下载',
            fileNotDownloadable                 : '下载不支援此档案格式',
            cannotPreview                       : '无法预览此档案',
            extensionNotSupported               : '上传档案不支援此档案格式',
            fileExistContinue                   : '档案已存在，是否要覆盖？',
            confirmGToF                         : 'GCode 上传后会自动转档成 FCode，是否继续？',
            updatePrintPresetSetting            : 'FLUX STUDIO 有新的预设列印参数。\n是否要更新？（会删除目前参数）',
            confirmFileDelete                   : '是否确定要删除这个档案？',
            task: {
                EXTRUDER                        : '列印',
                PRINT                           : '列印',
                LASER                           : '雷射雕刻',
                DRAW                            : '数位绘图',
                CUT                             : '贴纸切割',
                VINYL                           : '贴纸切割',
                BEAMBOX                         : '雷射雕刻',
                'N/A'                           : '自由模式'
            },
            device: {
                EXTRUDER                        : '列印工具头',
                LASER                           : '雕刻工具头',
                DRAW                            : '绘制工具头'
            },
            cant_get_toolhead_version           : '无法取得最新版本资讯'
        },
        alert: {
            caption: '错误',
            duplicated_preset_name: '重复的预设名称',
            info: '讯息',
            warning: '警告',
            error: '错误',
            retry: '重试',
            abort: '放弃',
            cancel: '取消',
            close: '关闭',
            ok: '确定',
            yes: ' 是',
            no: '否',
            stop: '停止'
        },
        caption: {
            connectionTimeout: '连线逾时'
        },
        message: {
            connecting: '连线中...',
            connectingMachine: '连接 %s 中...',
            connected: '已连线',
            authenticating: '密码验证中...',
            runningTests: '运动测试中...',
            machineNotConnected: 'Machine is not connected',
            notPrinting: 'Printing is not in progress',
            nothingToPrint: 'Nothing to print (source blob missing)',
            connectionTimeout: '请确认你的网路状态和机器的 Wi-Fi 指示灯是否为恒亮',
            device_not_found: {
                caption: '找不到预设机器',
                message: '请确认预设机器的 Wi-Fi 指示灯，或取消设定预设机器'
            },
            device_busy: {
                caption: '机器忙碌中',
                message: '机器正在进行另外一项工作，请稍候再试。如果机器持续没有回应，请将机器重新启动。'
            },
            device_is_used: '机器正被使用中，是否要终止现在任务？',
            device_in_use: '机器正被使用中，请停止或暂停目前的任务',
            invalidFile: '档案不是正确的 STL 格式',
            failGeneratingPreview: '无法储存预览图',
            slicingFailed: 'Slic3r 切片错误',
            no_password: {
                content: '请用 USB 设定机器密码，以提供此台电脑连线',
                caption: '未设定密码'
            },
            image_is_too_small: '图档内容有误',
            monitor_too_old: {
                caption: '韧体需要更新',
                content: '请按照<a target="_blank" href="http://helpcenter.flux3dp.com/hc/zh-tw/articles/216251077">此说明</a>安装最新韧体版本'
            },
            cant_establish_connection: '无法正常启动 FLUX Studio API，建议手动安装 Visual C++ Redistributable 2015，如持续发生，请<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/requests/new" target="_blank">联系 FLUX 客服</a>',
            application_occurs_error: '应用程式发生异常，请使用“功能表 > 说明 > 错误回报”',
            error_log: '错误讯息',
            fcodeForLaser: '档案为雕刻工作',
            fcodeForPen: '档案为绘图工作',
            confirmFCodeImport: '载入.fc档案将清除目前所有场景，是否继续？',
            confirmSceneImport: '载入.fsc档案将清除目前所有场景，是否继续？',
            brokenFcode: '无法开启 %s',
            slicingFatalError: '切片时发生错误，请上传模型档案给 FLUX 客服',
            unknown_error: '无法与机器建立连线，请使用“功能表 > 说明 > 错误回报”',
            unknown_device: '无法与机器建立连线，请确认 USB 有连接于机器',
            important_update: {
                caption: '重要更新',
                message: 'Delta 有重要韧体更新，是否要现在更新？',
            },
            unsupport_osx_version: '不支援此 Mac OS X 版本',
            need_password: '需要密码与机器建立连线',
            new_app_downloading: 'FLUX Studio 下载中',
            new_app_download_canceled: 'FLUX Studio 下载已被取消',
            new_app_downloaded: '新版FLUX Studio 下载完毕',
            ask_for_upgrade: '马上升级吗?',
            please_enter_dpi: '请输入该档案的 dpi',
            need_1_1_7_above: '请更新 Delta 韧体到 v1.1.7 以上',
            gcode_area_too_big: '汇入的 gcode 档案超过列印范围',
            empty_file: '档案内容不存在',
            usb_unplugged: 'USB 连线逾时，请确认与机器的连接',
            launghing_from_installer_warning: 'FLUX Studio 不是从应用程式资料夹开启，可能会产生问题。请将 FLUX Studio 移到应用程式资料夹再使用。',
            uploading_fcode: '正在上传 fcode',
            cant_connect_to_device: '无法连结机器，请确认机器是否开启，以及与机器的连结方式',
            unable_to_find_machine: '无法连接到机器 ',
            unable_to_start: '无法开始工作，如果持续发生，请附上错误回报，与我们联络:\n',
            camera_fail_to_transmit_image: '相机传输照片异常，请将 Beambox 重新开机。如果问题持续发生，请与我们联络。'
        },
        machine_status: {
            '-10': '原生模式',
            '-2': '扫描中',
            '-1': '维护中',
            0: '待命中',
            1: '初始化',
            2: 'ST_TRANSFORM',
            4: '启动中',
            6: '回复中',
            16: '工作中',
            18: '回复中',
            32: '已暂停',
            36: '已暂停',
            38: '暂停中',
            48: '已暂停',
            50: '暂停中',
            64: '已完成',
            66: '完成中',
            128: '已中断',
            UNKNOWN: '-'
        },
        head_module: {
            EXTRUDER: '列印',
            LASER: '雷射',
            UNKNOWN: '',
            error: {
                'missing': '错误讯息不足',
                '0': '未知模组工具头',
                '1': '侦测感应器无法连线',
                '2': 'No hello', // pi will send head_error_reset before this is issued
                '3': '#112 工具头校正失误\n请重新装载工具头，并确认磁铁关节的附着',
                '4': '#162 侦测到工具头倾斜\n请确认球型关节正确附着以继续',
                '5': '#162 侦测到工具头倾斜\n请确认球型关节正确附着以继续',
                '6': '#119 列印工具头无法控制温度，请联系 FLUX 客服。',
                '7': '#113 风扇无法转动\n请尝试用细针戳一下 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217732178">暸解更多</a>',
                '8': '#116 侦测到雕刻工具头倾斜\n请确认金属棒正确连结，雕刻头与握架紧密结合以继续<a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/217085937">了解更多</a>',
                '9': '#118 列印工具头无法加温，请联系 FLUX 客服。'
            }
        },
        change_filament: {
            home_caption: '更换线料',
            load_filament_caption: '进料',
            load_flexible_filament_caption: '进软料',
            unload_filament_caption: '退料',
            cancel: '取消',
            load_filament: '进料',
            load_flexible_filament: '进软料',
            unload_filament: '退料',
            next: '下一步',
            heating_nozzle: '列印工具头加热中',
            unloading: '自动退料中',
            loaded: '进料完成',
            unloaded: '退料完成',
            ok: '确定',
            kicked: '进料程序被中断',
            auto_emerging: '请插入线料',
            loading_filament: '进料中',
            maintain_head_type_error: '列印工具头未正确安装',
            disconnected: '连线不稳，请确认机器连线状况并稍后再试一次',
            maintain_zombie: '请重新启动机器',
            toolhead_no_response: '#117 列印工具头没有回应 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/218347477">暸解更多</a>'
        },
        head_temperature: {
            title: '开启喷头温度',
            done: '结束',
            target_temperature: '目标温度',
            current_temperature: '目前温度',
            set: '设定',
            incorrect_toolhead: '错误工具头，请使用列印工具头',
            attach_toolhead: '请插上列印工具头'
        },
        camera_calibration: {
            camera_calibration: '相机校正',
            next: '下一步',
            cancel: '取消',
            back: '上一步',
            finish: '完成',
            please_goto_beambox_first: '请先选择 Beambox 功能，再进行校正',
            please_place_paper: '请将干净 A4 白纸放在工作区域的左上角',
            please_refocus: '请旋转升降平台旋钮，直到轻触焦距螺丝，完成对焦',
            taking_picture: '撷取图片中...',
            start_engrave: '开始绘制校正图片',
            analyze_result_fail: '校正失败<br/>请确认:<br/>1. 校正图片完整画在 A4 纸上<br/>2. 已旋转升降平台旋钮，直到轻触焦距螺丝，完成对焦',
            drawing_calibration_image: '绘制校正图片中...',
            please_confirm_image: '<div><img class="img-center" src=%s /></div>请确认:<br/>1. 校正图片完整画在 A4 纸上<br/>2. 已旋转升降平台旋钮，直到轻触焦距螺丝，完成对焦<br/>3. 若雷射没成功射出，请至 Beambox 机器面板上选择"动作"，并将"功率倍率"与"速度倍率"调回正常值，再重新校正一次。',
            calibrate_done: '校正相机完成<br/>使用时请正确对焦以取得良好的预览效果。'
        },
        input_machine_password: {
            require_password: '"%s" 需要密码',
            connect: '连接',
            password: '密码'
        },
        set_default: {
            success: '%s 已设为预设机器',
            error: '由于网路问题，无法将 %s 设为预设机器'
        },
        tutorial: {
            set_first_default_caption: '欢迎使用',
            set_first_default: '是否要将 %s 设为预设机器?',
            startWithFilament: '首先，让我们先填装线料',
            startWithModel: '接下来，让我们载入范例3Ｄ模型',
            startTour: '嗨，欢迎<br/>这是你第一次使用列印功能,<br/>你希望观看列印功能教学吗？',
            clickToImport: '点击汇入以载入 3D 模型',
            selectQuality: '选择列印品质',
            clickGo: '按下开始以准备列印',
            startPrint: '确定平台上没有格线，并于平台上涂上足厚口红胶待其干燥，即可开始列印',
            skip: '跳过教学',
            startPrintDeltaPlus: '确认将磁铁列印版放上平台',
            runningMovementTests: '进行运动测试',
            connectingMachine: '连接机器中',
            movementTestFailed: { caption: '无法通过运动测试',  message: '1. 请确认工具头连接线不会造成过大阻力<br/>2. 上盖工具头连接线接头没入约一半<br/>3. 可尝试将工具头连接线顺时针或逆时针旋转 180 度再插入<br/>4. 参考 <a target="_blank" href="https://flux3dp.zendesk.com/hc/zh-tw/articles/115003674128">此篇文章</a><br/>再试一次？' },
            befaultTutorialWelcome: '非常感谢您购买 FLUX Delta+！<br/><br/>以下内容能帮助您快速了解并使用您的 FLUX Delta+<br/>期待 FLUX Delta+ 能陪伴您度过美好的时光<br/><br/>＊请务必先观看教学影片！请打开中文字幕',
            openBrowser: '开启网页',
            welcome: '欢迎使用'
        },
        slicer: {
            computing: '计算中',
            error: {
                '6': '工作路径超过列印范围, 请缩小物体尺寸、关闭底座、底部延伸圈数或是边界预览',
                '7': '进阶设定参数错误\n',
                '8': '切片:: 切片结果要求早于切片结束',
                '9': '切片:: 路径结果要求早于切片结束',
                '10': '切片:: 原始模型不存在于切片引擎，需重启 FLUX Studio',
                '13': '切片:: 重制错误，复制原始ID不存在，需重启 FLUX Studio',
                '14': '切片:: 无法设定物件位置及相关资讯，需重启 FLUX Studio',
                '15': '切片:: 模型档案内容无法解析',
                '16': '切片:: 切片引擎异常结束，建议调整设定',
                '1006': 'WS 已被强制关闭, 请于menu上方取得错误回报，寄送回FLUX'
            },
            pattern_not_supported_at_100_percent_infill: 'Slic3r 的 rectilinear 填充图样只支援 100% 的填充密度'
        },
        calibration: {
            RESOURCE_BUSY: '请确认机器的状态是于待命中',
            headMissing: '无法取得工具头资讯，请确认工具头是否连接于机器',
            calibrated: '平台校正完成',
            extruderOnly: '请使用列印工具头来做校正'
        },
        head_info: {
            ID                  : 'ID',
            VERSION             : '工具头韧体版本',
            HEAD_MODULE         : '工具头种类',
            EXTRUDER            : '列印模组',
            LASER               : '雷刻模组',
            USED                : '使用时间',
            HARDWARE_VERSION    : '硬体版本',
            FOCAL_LENGTH        : '焦距调整',
            hours               : '小时',
            cannot_get_info     : '无法读取工具头资讯'
        }
    };
});
