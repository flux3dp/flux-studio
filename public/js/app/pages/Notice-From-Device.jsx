define([
    'react',
    'app/actions/initialize-machine',
    'jsx!widgets/Modal',
    'helpers/sprintf'
], function(
    React,
    initializeMachine,
    Modal,
    sprintf
) {
    'use strict';

    return function(args) {

        args = args || {};

        return React.createClass({

            // Lifecycle
            getInitialState: function() {
                return {
                    lang: args.state.lang
                };
            },

            _restartStudio: function(e) {
                initializeMachine.completeSettingUp(true);
                location.reload();
            },

            render : function() {
                var lang = this.state.lang,
                    localLang = lang.initialize.notice_from_device,
                    settingPrinter = initializeMachine.settingPrinter.get(),
                    wrapperClassName = {
                        'initialization': true
                    },
                    successfullyStatement = sprintf(localLang.successfully_statement, settingPrinter.apName),
                    content = (
                        <div className="notice-from-device text-center">
                            <img className="brand-image" src="/img/menu/main_logo.svg"/>
                            <div className="connecting-means">
                                <h1 className="headline">{localLang.headline}</h1>
                                <h2 className="subtitle">{localLang.subtitle}</h2>
                                <div className="signal-means row-fluid clearfix">
                                    <img className="signal-position col" src="/img/wifi-indicator.png"/>
                                    <div className="signal-description col">
                                        <article className="row-fluid clearfix">
                                            <span className="green-light col"/>
                                            <h4 className="green-light-desc col">
                                                {localLang.light_on}
                                                <p>{localLang.light_on_desc}</p>
                                            </h4>
                                        </article>
                                        <article className="row-fluid clearfix">
                                            <span className="green-light breathing col"/>
                                            <h4 className="green-light-desc col">
                                                {localLang.breathing}
                                                <p>{localLang.breathing_desc}</p>
                                            </h4>
                                        </article>
                                    </div>
                                </div>
                                <article>
                                    <p className="headline">{localLang.successfully}</p>
                                    <p className="subtitle">{successfullyStatement}</p>
                                </article>
                                <div className="button-group btn-v-group">
                                    <button data-ga-event="restart-flux-studio" className="btn btn-action btn-large" onClick={this._restartStudio}>
                                        {localLang.restart}
                                    </button>
                                    <a href="#initialize/wifi/select" data-ga-event="back" className="btn btn-link btn-large">
                                        {lang.initialize.back}
                                    </a>
                                </div>
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