define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Select',
    'app/actions/alert-actions'
], function($, React, i18n, config, SelectView, AlertActions) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            notificationOptions = [],
            View = React.createClass({
                _checkIPFormat: function(e) {
                    var me = e.currentTarget,
                        originalIP = config().read('poke-ip-addr'),
                        ip = me.value,
                        lang = args.state.lang,
                        ipv4Pattern = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/g;

                    if ('' !== ip && false === ipv4Pattern.test(ip)) {
                        me.value = originalIP;
                        AlertActions.showPopupError('laser-upload-error', lang.settings.wrong_ip_format);
                    }
                    else {
                        // save ip
                        config().write('poke-ip-addr', ip);
                    }

                },

                _updateSlicingEnginePath: function(e) {
                    config().write('slicing-engine-path', e.target.value);
                },

                _switchNotification: function(e) {
                    config().write('notification', e.currentTarget.value);
                },

                render : function() {
                    var lang = args.state.lang,
                        pokeIP = config().read('poke-ip-addr'),
                        enginePath = config().read('slicing-engine-path');

                    return (
                        <div className="form general">

                            <div className="row-fluid">

                                <div className="span3 no-left-margin">
                                    <label className="font2">
                                        {lang.settings.language}
                                    </label>
                                </div>

                                <div className="span8">
                                    <SelectView id="select-lang" className="font3" options={options}/>
                                </div>

                            </div>

                            <div className="row-fluid">

                                <div className="span3 no-left-margin">
                                    <label className="font2">
                                        {lang.settings.notifications}
                                    </label>
                                </div>

                                <div className="span8">
                                    <SelectView className="font3" options={notificationOptions} onChange={this._switchNotification}/>
                                </div>

                            </div>

                            <div className="row-fluid">

                                <div className="span3 no-left-margin">
                                    <label className="font2">
                                        {lang.settings.ip}
                                    </label>
                                </div>

                                <div className="span8 font3">
                                    <input type="text" autoComplete="false" defaultValue={pokeIP} onBlur={this._checkIPFormat}/>
                                </div>

                            </div>

                            <div className="row-fluid">

                                <div className="span3 no-left-margin">
                                    <label className="font2">
                                        {lang.settings.cura_engine_path}
                                    </label>
                                </div>

                                <div className="span8 font3">
                                    <input type="text" autoComplete="false" defaultValue={enginePath} onBlur={this._updateSlicingEnginePath}/>
                                </div>

                            </div>
                        </div>
                    );
                },

                getInitialState: function() {
                    return args.state;
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        notificationOptions = [
            {
                value: 0,
                label: args.state.lang.settings.notification_off,
                selected: config().read('notification') === '0'
            },
            {
                value: 1,
                label: args.state.lang.settings.notification_on,
                selected: config().read('notification') === '1'
            }
        ];

        return View;
    };
});
