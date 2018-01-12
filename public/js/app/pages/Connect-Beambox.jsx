define([
    'react',
    'jsx!widgets/Modal',
    'app/actions/initialize-machine',
    'helpers/api/config',
    'helpers/i18n',
], function (
    React,
    Modal,
    initializeMachine,
    config,
    i18n
) {
    'use strict';

    const LANG = i18n.lang.initialize.connect_beambox;

    return function () {
        return React.createClass({
            onStart: function() {
                initializeMachine.completeSettingUp(true);
            },
            onOpenTutorialLink: function() {
                const url = LANG.tutorial_url;
                window.open(url);
            },
            _renderSelectMachineStep: function () {
                return (
                    <div>
                        <h1 className="main-title">{LANG.set_beambox_connection}</h1>
                        <div>{LANG.please_goto_touchpad}</div>
                        <div className="tutorial">
                            {LANG.tutorial}
                        </div>
                        <div className="tutorial-video">
                            <a onClick={this.onOpenTutorialLink}>
                                {LANG.please_see_tutorial_video}
                            </a>
                        </div>
                        <button className="btn btn-action btn-large start" data-ga-event="start" onClick={this.onStart}>
                            {i18n.lang.initialize.setting_completed.start}
                        </button>
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
