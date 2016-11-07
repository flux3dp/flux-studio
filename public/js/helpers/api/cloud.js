define([], function() {
    const ip = 'https://35.161.43.14:3000';
    // const ip = 'https://localhost:3000';
    const userProtocol = '/users';
    const deviceProtocol = '/devices';
    const headers = new Headers({ 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'});

    const userUrl = (name) => { return `${ip}${userProtocol}/${name}`; };
    const deviceUrl = (name) => { return `${ip}${deviceProtocol}/${name}`; };

    const constructBody = (obj) => {
    let body = Object.keys(obj).map(key => `${key}=${obj[key]}&`).join('');
       return body.slice(0, body.length - 1);
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

    const resendVerification = (email) => {
        let body = constructBody({email});
    	return post(userUrl('resendVerification'), body);
    };

    const resetPassword = (email) => {
    	let body = constructBody({ email });
    	return post(userUrl('forgotPassword'), body);
    };

    const getMe = () => {
        return get(userUrl('me'), '');
    };

    // Device

    const bindDevice = (uuid, token, accessId, signature) => {
        let body = constructBody({ token, accessId, signature }),
            bindDeviceUrl = `${ip}${deviceProtocol}/${uuid}/bind`;
        return post(bindDeviceUrl, body);
    };

    return {
        signIn,
        signUp,
        resendVerification,
        resetPassword,
        getMe,
        bindDevice
    };
});
