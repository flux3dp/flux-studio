define([], function() {
    // const ip = 'https://35.161.43.14:3000';
    const _ip = {
        dev: 'https://127.0.0.1:3000',
        prod: 'https://cloudserv1.flux3dp.com:3000'
    };
    const ip = window.FLUX.dev ? _ip.dev : _ip.prod;
    const userProtocol = '/users';
    const deviceProtocol = '/devices';
    const headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'});

    const userUrl = (name) => { return `${ip}${userProtocol}/${name}`; };
    const deviceUrl = (name) => { return `${ip}${deviceProtocol}/${name}`; };

    const constructBody = (obj) => {
        return Object.keys(obj)
            .map(key => `${key}=${encodeURIComponent(obj[key])}`)
            .join('&');
    };

    const post = (targetUrl, body) => {
        return fetch(targetUrl, {method: 'POST', credentials:'include', headers, body });
        // return fetch(url, {method: 'POST', headers, body });
    };

    const get = (targetUrl) => {
        return fetch(targetUrl, {method: 'GET', credentials:'include', headers });
    };

    // User

    const signIn = (email, password) => {
        let body = constructBody({email, password});
        return post(userUrl('signIn'), body);
    };

    const signUp = (nickname, email, password) => {
        let body = constructBody({nickname, email, password});
        return post(userUrl('signUp'), body);
    };

    const signOut = () => {
        return post(userUrl('logout'), '');
    };

    const resendVerification = (email) => {
        let body = constructBody({email});
        return post(userUrl('resendVerification'), body);
    };

    const resetPassword = (email) => {
        let body = constructBody({ email });
        return post(userUrl('forgotPassword'), body);
    };

    const changePassword = (param) => {
        let body = constructBody(param);
        return post(userUrl('updateInfo'), body);
    };

    const getMe = () => {
        return get(userUrl('me'), '');
    };

    const getDevices = () => {
        return get(deviceUrl('list'), '');
    };

    // Device

    const bindDevice = (uuid, token, accessId, signature) => {
        let body = constructBody({ token, accessId, signature }),
            bindDeviceUrl = `${ip}${deviceProtocol}/${uuid}/bind`;
        console.log("Trying to bind ", body);
        return post(bindDeviceUrl, body);
    };

    const unbindDevice = (uuid) => {
        let body = constructBody({ uuid }),
            unbindDeviceUrl = `${ip}${deviceProtocol}/${uuid}/unbind`;
        return post(unbindDeviceUrl, body);
    };

    return {
        signIn,
        signUp,
        signOut,
        getDevices,
        resendVerification,
        resetPassword,
        changePassword,
        getMe,
        bindDevice,
        unbindDevice
    };
});
