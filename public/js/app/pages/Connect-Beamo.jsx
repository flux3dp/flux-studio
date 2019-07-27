define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Button-Group',
    'app/actions/initialize-machine',
    'app/actions/alert-actions',
    'app/actions/beambox/beambox-preference',
    'helpers/sprintf',
    'helpers/i18n'
], function (
    React,
    Modal,
    ButtonGroup,
    initializeMachine,
    AlertActions,
    BeamboxPreference,
    sprintf,
    i18n
) {
    const LANG = i18n.lang.initialize;

    return function () {
        return React.createClass({
            onStart: function() {
                BeamboxPreference.write('model', 'fbm1');

                const pokeIPAddr = localStorage.getItem('poke-ip-addr');
                const deviceIP = document.getElementById('machine_ip_init').value;

                if (deviceIP) {
                    if (!deviceIP.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
                        return AlertActions.showPopupError('ip-wrong', LANG.ip_wrong);
                    }
                    if (pokeIPAddr && pokeIPAddr !== '') {
                        let pokeIPAddrArr = pokeIPAddr.split(/[,;] ?/);
                        if (pokeIPAddrArr.indexOf(deviceIP) === -1) {
                            if (pokeIPAddrArr.length > 19) {
                                pokeIPAddr = pokeIPAddrArr.slice(pokeIPAddrArr.length - 19, pokeIPAddrArr.length);
                            }
                            localStorage.setItem('poke-ip-addr', `${pokeIPAddr}, ${deviceIP}`);
                        }
                    } else {
                        localStorage.setItem('poke-ip-addr', deviceIP);
                    }
                }

                initializeMachine.completeSettingUp(true);
                location.reload();
            },
            onOpenTutorialLink: function() {
                const url = sprintf(LANG.tutorial_url, "beamo");
                window.open(url);
            },
            _renderSelectMachineStep: function () {
                var buttons = [
                    {
                        label: LANG.please_see_tutorial_video,
                        className: 'btn btn-link btn-large',
                        type: 'link',
                        onClick: this.onOpenTutorialLink
                    },
                    {
                        label: LANG.start,
                        className: 'btn btn-action btn-large start',
                        onClick: this.onStart,
                        href: '#initialize/wifi/setup-complete/with-usb'
                    }
                ];
                return (
                    <div>
                        <h1 className="main-title">{sprintf(LANG.set_connection, "beamo")}</h1>
                        <div>{sprintf(LANG.please_goto_touchpad, "beamo")}</div>
                        <div className="tutorial">
                            {LANG.tutorial}
                            <input type="text" id="machine_ip_init" placeholder="x.x.x.x"></input>
                        </div>
                        <ButtonGroup className="btn-v-group" buttons={buttons}/>
                    </div>
                );
            },

            render: function () {
                const wrapperClassName = {
                    'initialization': true
                };
                const innerContent = this._renderSelectMachineStep();
                const content = (
                    <div className="connect-beambox text-center">
                        {innerContent}
                    </div>
                );

                return (
                    <Modal className={wrapperClassName} content={content} />
                );
            },

        });
    };
});
