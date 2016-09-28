define([
    'helpers/local-storage'
],function(
    LocalStorage
) {
    return function(deviceListObject) {
        let bl = LocalStorage.get('black-list');
        if(bl !== '') {
            let list = bl.split(',');
            return Object.keys(deviceListObject).filter(o => list.indexOf(deviceListObject[o].name) === -1).map((p) => deviceListObject[p]);
        }
        return Object.keys(deviceListObject).filter(k => k !== '').map((p) => deviceListObject[p]);
    };
});
