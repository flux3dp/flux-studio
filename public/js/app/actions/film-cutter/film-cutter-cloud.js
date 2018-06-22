define([
    'app/actions/film-cutter/record-manager',
], function(
    RecordManager
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

    const getAuthHeaders = () => {
        const headers = getBaseHeaders();
        const account = RecordManager.read('account');
        const password = RecordManager.read('password');
        headers.set('Authorization', 'Basic ' + btoa(account + ':' + password));
        return headers;
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
            throw new Error(err.message.toString() || JSON.stringify(err));
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
        sendSMSVerificationCode: async (phone_number, reason) => {
            await post('api/user/send-sms-verification-code', {phone_number, reason}, false);
            return;
        },
        checkVerificationCode: async (phone_number, reason, verification_code) => {
            await get('api/user/check-verification-code', {phone_number, reason, verification_code}, false);
            return;
        },
        registration: async ({phone_number, password, last_name, first_name, shop_name, shop_address, verification_code}) => {
            await post('api/user/registration', {phone_number, password, last_name, first_name, shop_name, shop_address, verification_code}, false);
            return;
        },
        userData: async () => {
            const res = await get('api/user/user-data').then(x => x.json());
            const {
                'usage_cut': {overall, used},
                'usage_download': {expired_time},
            } = res;
            const machines = res.machines.map(m => {
                return {
                    'pi_serial_number': m.pi_serial_number,
                    'stm32_serial_number': m.stm32_serial_number,
                    'machine_model': m.machine_model
                };
            });
            return {
                'usage_cut': {'overall': overall, 'used': used},
                'usage_download': {'expired_time': expired_time},
                'machines': machines
            };
        },
        changePassword: async (new_password) => {
            await patch('api/user/change-password', {'password': new_password});
            return;
        },
        forgetPassword: async (phone_number, new_password, verification_code) => {
            await patch('api/user/forget-password', {
                'phone_number': phone_number,
                'password': new_password,
                'verification_code': verification_code
            });
            return;
        },
        bindMachine: async (stm32_serial_number, pi_serial_number, machine_model) => {
            await post('api/user/bind-machine', {
                'stm32_serial_number': stm32_serial_number,
                'pi_serial_number': pi_serial_number,
                'machine_model': machine_model
            });
            return;
        },
        increaseUsageCut: async (used_recently) => {
            return {'overall': overall, 'used': used} = await patch('api/user/increase-usage-cut', {'used_increase': used_recently}).then(x => x.json());

        },
        newFilmInfo: async (last_sync_film_data) => {
            return {info, synchronize_time} = await get('api/data/new-film-info', {last_sync_film_data})
                .then(res => res.json());
        },
        newFilm: async (ids, modified_before) => {
            return blob = await get('api/data/new-film', {id: ids, modified_before})
                .then(res => res.blob());
        },
    };
});
