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
            .map(key => `${key}=${encodeURIComponent(json[key])}`)
            .join('&');
    };

    // const post = (apiUrl, json, auth=true) => {
    //     return fetch(
    //         `${ip}/${apiUrl}`,
    //         {
    //             method: 'POST',
    //             headers: auth ? getAuthHeaders() : getBaseHeaders(),
    //             body: JSON.stringify(json)
    //         }
    //     );
    // };

    // const patch = (apiUrl, json, auth=true) => {
    //     return fetch(
    //         `${ip}/${apiUrl}`,
    //         {
    //             method: 'PATCH',
    //             headers: auth ? getAuthHeaders() : getBaseHeaders(),
    //             body: JSON.stringify(json)
    //         }        );
    // };

    const get = async (apiUrl, json, auth=true) => {
        const res = await fetch(
            `${ip}/${apiUrl}${joinUrlParameters(json)}`,
            {
                method: 'GET',
                headers: auth ? getAuthHeaders() : getBaseHeaders(),
            }
        );
        if (!res.ok) {
            throw new Error('伺服器錯誤，請聯絡客服人員');
        }
        return res;
    };

    return {
        // post,
        // patch,
        get
    };
});
