define(function() {
    'use strict';

    return {
        brand_name : 'FLUX',
        app : {
            name : 'Flux Studio - zh-tw'
        },
        welcome: {
            header1: 'Hello! 歡迎使用 FLUX，請選擇你想使用的語言',
            header2: '我們即將開始為你的 FLUX 進行設定 :)',
            start: '開始'
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
            }
        },
        menu: {
            print: '列印',
            laser: 'Laser',
            scan: 'Scan',
            usb: 'USB'
        },
        settings: {
            caption: '設定',
            tabs: {
                general: '一般',
                flux_cloud: 'FLUX Could',
                printer: '印表機'
            },
            language: '語言',
            notifications: '通知',
            close: '關閉',
            printer: {
                new_printer: '新增印表機',
                name: '印表機名稱',
                current_password: '目前密碼',
                set_password: '設定密碼',
                security_notice: '你可以用密碼保護你的印表機',
                connected_wi_fi: 'Wi-Fi 連線',
                advanced: '進階',
                join_other_network: '加入其它網路',
                disconnect_with_this_printer: '中斷這台印表機的連線'
            },
            flux_cloud: {
                caption: 'Get FLUX 3D Printer be remote!',
                line1: 'Control your FLUX 3D Printer with FLUX Cloud in anywhere you are',
                start_to_use: 'Start to Use',
                i_have_an_account: 'I have an account'
            }
        }
    };
});