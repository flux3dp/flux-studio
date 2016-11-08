define(['helpers/i18n'], function (i18n) {
    'use strict';

    const lang = i18n.get();

    const AUTO_POKE_INTERVAL = 3000;
    const AUTO_DISCOVER = 1000;

    var Discover = null,
        autoPokes = [],
        guessIPs = [],
        solidIPs = [];

    const self = {
        /**
         * Init
         * @param {Websocket} Discover ws object
         */
        init: (discoverObj) => {
            Discover = discoverObj;
            setInterval(function() {
                if(Discover.countDevices() == 0){
                    self.pokeNext();
                }
            }, AUTO_DISCOVER);
            //Start from self ip address
            var myIPAddresses = self.getLocalAddresses();
            myIPAddresses.forEach( x => self.guessFromIP(x) );
            console.log(guessIPs);
        },
        /**
         * Return if smart unpn has been initiated
         * @returns {Bool} if smart unpn has been initiated
         */
        isInitiated: () => {
            return Discover ? true : false;
        },
        /**
         * Generates smart guess ip lists
         */
        guessFromIP: (targetIP) => {
            const ipv4Pattern = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\.(\d{1,3})$/g;
            console.log("ip", targetIP);
            // if(ipv4Pattern.test(targetIP) === false) return false;
            var match = ipv4Pattern.exec(targetIP),
                i = 0,
                localIndex = parseInt(match[2]);
            if(match==null) return;
            for(i = localIndex + 1; i < Math.min(localIndex + 20, 255); i++){
                var gip = match[1] + "." + i;
                if(guessIPs.indexOf(gip) !== -1) continue;
                guessIPs.push(gip);
            }
            for(i = localIndex - 1; i > Math.max(0, localIndex - 20); i--){
                var gip = match[1] + "." + i;
                if(guessIPs.indexOf(gip) !== -1) continue;
                guessIPs.push(gip);
            }
            for(i = 1; i<255; i++){
                var gip = match[1] + "." + i;
                if(guessIPs.indexOf(gip) !== -1) continue;
                guessIPs.push(gip);
            }
        },
        pokeNext: function(){
            if(guessIPs.length == 0) return;
            var ip = guessIPs.shift();
            Discover.poke(ip);
            Discover.poke(ip);
        },
        addSolidIP: function(ip){
            if(solidIPs.indexOf(ip) !== -1) return;
            solidIPs.push(ip);
            for(var i in autoPokes) if(autoPokes[i].ip == ip) return;
            startPoke(ip);
        },
        getLocalAddresses: function(){
            if(!window['requireNode']) return ["192.168.1.1"];
            var os = requireNode('os');
            var ifaces = os.networkInterfaces();        
            var addresses = [];
            Object.keys(ifaces).forEach(function (ifname) {
                var alias = 0;
                ifaces[ifname].forEach(function (iface) {
                    if ('IPv4' !== iface.family || iface.internal !== false) {
                        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                        return;
                    }
                    if(ifname.indexOf('vnic') == 0) return;
                    addresses.push(iface.address);
                });
            });
            return addresses;
        },
        /**
        * Start auto poke for IP
        * @param {String} targetIP 
        * @returns {Object} An auto-upnp-poke object
        */
        startPoke: (targetIP) => {
            var pokeIP = targetIP;
            if(!self.isInitiated()) throw Exception("smart upnp hasn't been initiated");
            if ('string' !== typeof pokeIP || pokeIP == '') return;
            var autopoke = {
                ip: pokeIP,
                clock: setInterval(function() {
                    Discover.poke(pokeIP);
                }, AUTO_POKE_INTERVAL)
            };
            autoPokes.push(autopoke);
            return autopoke;
        },
        /**
         * Stop auto poke object
         * @param {Number} obj.clock 
         */
        stopPoke: (obj) => {
            clearInterval(obj.clock);
        }
    };
    return self;
});