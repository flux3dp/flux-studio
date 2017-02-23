define([
    'react',
    'helpers/sprintf',
    'app/actions/initialize-machine',
    'helpers/api/config',
    'helpers/api/usb-config',
    'jsx!widgets/Modal',
    'helpers/device-master'
], function(React, sprintf, initializeMachine, config, usbConfig, Modal, DeviceMaster) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({

            getInitialState: function() {
                return args.state;
            },

            componentDidMount: function() {
                if ('with-usb' !== this.props.other) {
                    initializeMachine.completeSettingUp(false);
                }

                DeviceMaster.unregisterUsbEvent('SETUP');
            },

            _goBack: function(e) {
                history.go(-1);
            },

            _onStart: function(e) {
                initializeMachine.completeSettingUp(true);
            },

            _getArticle: function(lang) {
                var settingPrinter = initializeMachine.settingPrinter.get(),
                    article = {};

                switch (this.props.other) {
                case 'with-wifi':
                    article = {
                        caption: lang.initialize.setting_completed.brilliant,
                        content: lang.initialize.setting_completed.begin_journey
                    };
                    break;
                case 'with-usb':
                    article = {
                        caption: lang.initialize.setting_completed.great,
                        content: lang.initialize.setting_completed.upload_via_usb
                    };
                    break;
                case 'station-mode':
                    article = {
                        caption: sprintf(lang.initialize.setting_completed.is_ready, settingPrinter.name || ''),
                        content: sprintf(lang.initialize.setting_completed.station_ready_statement, settingPrinter.name)
                    };
                    break;
                }

                return article;
            },

            render: function() {
                this.props.other = this.props.other || 'with-wifi';
                var wrapperClassName = {
                        'initialization': true
                    },
                    lang = this.state.lang,
                    article = this._getArticle(lang);

                function createMarkup(){
                    return {__html: article.content};
                }

                var startText = (
                        'with-usb' === this.props.other ?
                        lang.initialize.setting_completed.ok :
                        lang.initialize.setting_completed.start
                    ),
                    backToWifiSelect = (
                        'with-usb' === this.props.other ?
                        <button className="btn btn-link btn-large" data-ga-event="back" onClick={this._goBack}>
                            {lang.initialize.setting_completed.back}
                        </button> :
                        ''
                    ),
                    content = (
                        <div className="setting-completed text-center">
                            <img className="brand-image" src="/img/menu/main_logo.svg"/>
                            <h1 className="headline">{article.caption}</h1>
                            <p className="notice" dangerouslySetInnerHTML={createMarkup()}></p>
                            <div className="btn-v-group">
                                <button className="btn btn-action btn-large" data-ga-event="start" onClick={this._onStart}>
                                    {startText}
                                </button>
                                {backToWifiSelect}
                            </div>
                        </div>
                    );

                return (
                    <Modal className={wrapperClassName} content={content}/>
                );
            }
        });
    };
});
