define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Button-Group',
    'app/actions/initialize-machine',
    'app/actions/beambox/beambox-preference',
    'helpers/api/config',
    'helpers/i18n'
], function (
    React,
    Modal,
    ButtonGroup,
    initializeMachine,
    BeamboxPreference,
    Config,
    i18n
) {
    const LANG = i18n.lang.initialize.connect_beambox;

    return function () {
        return React.createClass({
            onStart: function() {
                const splitUrl = location.href.split('#');
                if (splitUrl.length > 2 && splitUrl[2] === 'Pro') {
                    BeamboxPreference.write('model', 'fbb1p');
                } else {
                    BeamboxPreference.write('model', 'fbb1b');
                }
                Config().write('default-app', 'beambox');
                initializeMachine.completeSettingUp(true);
                location.reload();
            },
            onOpenTutorialLink: function() {
                const url = LANG.tutorial_url;
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
                        label: i18n.lang.initialize.setting_completed.start,
                        className: 'btn btn-action btn-large start',
                        onClick: this.onStart,
                        href: '#initialize/wifi/setup-complete/with-usb'
                    }
                ];
                return (
                    <div>
                        <h1 className="main-title">{LANG.set_beambox_connection}</h1>
                        <div>{LANG.please_goto_touchpad}</div>
                        <div className="tutorial">{LANG.tutorial}</div>
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
                        <img className="brand-image" src="img/menu/main_logo.svg" />
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
