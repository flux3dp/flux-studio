define([
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/helper-functions',
    'app/actions/alert-actions',
], function(
    RecordManager,
    HelperFunctions,
    AlertActions
) {
    const _ip = {
        dev: 'http://0.0.0.0:3000',
        prod: 'http://0.0.0.0:3000'
    };
    const ip = window.FLUX.dev ? _ip.dev : _ip.prod;


    const getBaseHeaders = () => {
        return new Headers({
            'Content-Type': 'application/json',
        });
    };

    const getManualAuthHeader = (account, password) => {
        const headers = getBaseHeaders();
        headers.set('Authorization', 'Basic ' + btoa(`${account}:${password}`));
        return headers;
    };

    const getAuthHeaders = () => {
        const account = RecordManager.read('account');
        const password = RecordManager.read('password');
        return getManualAuthHeader(account, password);
    };

    const joinUrlParameters = (json) => {
        if(!json) {
            return '';
        }
        return '/?' + Object.keys(json)
            .map(key => {
                if (Array.isArray(json[key])) {
                    return json[key].map(x => `${key}=${encodeURIComponent(x)}`).join('&');
                } else {
                    return `${key}=${encodeURIComponent(json[key])}`;
                }
            })
            .join('&');
    };

    const errorHandlerWrapper = async (fetchPromise) => {
        const res = await fetchPromise.catch(error => {
            console.log(error);
            throw new Error('伺服器錯誤，請聯絡客服人員');
        });
        if (!res.ok) {
            const err = await res.json();
            console.error(err);
            throw new Error((err.message && err.message.toString()) || JSON.stringify(err));
        }
        return res;
    };

    const post = async (apiUrl, json, auth=true) => {
        return await errorHandlerWrapper(fetch(
            `${ip}/${apiUrl}`,
            {
                method: 'POST',
                headers: auth ? getAuthHeaders() : getBaseHeaders(),
                body: JSON.stringify(json)
            }
        ));
    };

    const get = async (apiUrl, json, auth=true) => {
        return await errorHandlerWrapper(fetch(
            `${ip}/${apiUrl}${joinUrlParameters(json)}`,
            {
                method: 'GET',
                headers: auth ? getAuthHeaders() : getBaseHeaders(),
            }
        ));
    };

    const patch = async (apiUrl, json, auth=true) => {
        return await errorHandlerWrapper(fetch(
            `${ip}/${apiUrl}`,
            {
                method: 'patch',
                headers: auth ? getAuthHeaders() : getBaseHeaders(),
                body: JSON.stringify(json)
            }
        ));
    };

    // wrap all return value, hope this is clear enough even if api doc missing
    return {
        async sendSMSVerificationCode(phone_number, reason) {
            await post('api/user/send-sms-verification-code', {phone_number, reason}, false);
            return;
        },
        async checkVerificationCode(phone_number, reason, verification_code) {
            await get('api/user/check-verification-code', {phone_number, reason, verification_code}, false);
            return;
        },
        async registration({phone_number, password, last_name, first_name, shop_name, shop_address, verification_code}) {
            await post('api/user/registration', {phone_number, password, last_name, first_name, shop_name, shop_address, verification_code}, false);
            return;
        },
        async login(account, password) {
            account = account || RecordManager.read('account');
            password = password || RecordManager.read('password');
            await errorHandlerWrapper(fetch(
                `${ip}/api/user/login`,
                {
                    method: 'GET',
                    headers: getManualAuthHeader(account, password)
                }
            ));
            HelperFunctions.toggleLoginMenu({myAccount: true, signIn: false, signOut: true});
        },
        async userData() {
            const {
                'usage_cut': {overall, used},
                'usage_download': {expired_time},
                'machine': {pi_serial_number, stm32_serial_number, machine_model}
            } = await get('api/user/user-data').then(x => x.json());;
            return {
                'usage_cut': {
                    'overall': overall,
                    'used': used
                },
                'usage_download': {
                    'expired_time': expired_time
                },
                'machine': {
                    'pi_serial_number': pi_serial_number,
                    'stm32_serial_number': stm32_serial_number,
                    'machine_model': machine_model
                }
            };
        },
        async userProfile() {
            return {
                'phone_number': phone_number,
                'last_name': last_name,
                'first_name': first_name,
                'shop_name': shop_name,
                'shop_address': shop_address,
            } = await get('api/user/user-profile').then(x => x.json());;
        },
        async changePassword(new_password) {
            await patch('api/user/change-password', {'password': new_password});
            return;
        },
        async forgetPassword(phone_number, new_password, verification_code) {
            await patch('api/user/forget-password', {
                'phone_number': phone_number,
                'password': new_password,
                'verification_code': verification_code
            });
            return;
        },
        async bindMachine(stm32_serial_number, pi_serial_number, machine_model) {
            await post('api/user/bind-machine', {
                'stm32_serial_number': stm32_serial_number,
                'pi_serial_number': pi_serial_number,
                'machine_model': machine_model
            });
            return;
        },
        async increaseUsageCut(used_recently) {
            return {'overall': overall, 'used': used} = await patch('api/user/increase-usage-cut', {'used_increase': used_recently}).then(x => x.json());

        },
        async filmSecretKey() {
            const {film_secret_key} = await get('api/data/film-secret-key').then(x => x.json());
            return film_secret_key;
        },
        async newFilmInfo() {
            const last_sync_film_data = RecordManager.read('last_sync_film_data');
            return {info, synchronize_time} = await get('api/data/new-film-info', {last_sync_film_data})
                .then(res => res.json());
        },
        async newFilm(ids, modified_before) {
            return blob = await get('api/data/new-film', {id: ids, modified_before})
                .then(res => res.blob());
        },

        async sync() {
            // user profile
            const profile = await this.userProfile();
            RecordManager.write('last_name', profile.last_name);
            RecordManager.write('first_name', profile.first_name);
            RecordManager.write('shop_name', profile.shop_name);
            RecordManager.write('shop_address', profile.shop_address);

            // usage_cut
            const {overall, used} = await this.increaseUsageCut(RecordManager.read('usage_cut_recorded'));
            RecordManager.write('usage_cut_recorded', 0);
            RecordManager.write('usage_cut_overall_on_cloud', overall);
            RecordManager.write('usage_cut_used_on_cloud', used);


            const {usage_download, machine} = await this.userData();

            // 更新usage_download
            RecordManager.write('usage_download', usage_download.expired_time);

            // machine
            RecordManager.write('machine_stm32_serial_number', machine.stm32_serial_number);
            RecordManager.write('machine_pi_serial_number', machine.pi_serial_number);

            // film secret key
            const keyOnCloud = await this.filmSecretKey();
            const keyAtLocal = RecordManager.read('film_secret_key');
            if (keyAtLocal !== '' && keyAtLocal !== keyOnCloud) {
                AlertActions.showPopupError('sync', '您已切換不同的帳號，所有已下載的手機膜數據將無法使用新的密鑰解密。請清除數據後重新下載');
            }
            RecordManager.write('film_secret_key', keyOnCloud);

            // update last connect to cloud
            RecordManager.write('last_connect_to_cloud', Date.now());
        },
        async signOut() {
            RecordManager.write('password', '');
            RecordManager.write('film_secret_key', '');
            RecordManager.write('machine_stm32_serial_number', '');
            RecordManager.write('machine_pi_serial_number', '');
            RecordManager.write('last_name', '');
            RecordManager.write('first_name', '');
            RecordManager.write('shop_name', '');
            RecordManager.write('shop_address', '');
            RecordManager.write('should_init_usage_cut_from_machine', 'yes');
            RecordManager.write('usage_cut_recorded', 0);
            RecordManager.write('usage_cut_overall_on_cloud', 0);
            RecordManager.write('usage_cut_used_on_cloud', 0);
            RecordManager.write('usage_download', 0);
            RecordManager.write('last_connect_to_cloud', 0);
            RecordManager.write('last_sync_film_data', 0);
            HelperFunctions.toggleLoginMenu({myAccount: false, signIn: true, signOut: false});
            AlertActions.showPopupError('sync', '您已登出，請重新登入原帳號來使用已下載的手機膜數據');
        }
    };
});
