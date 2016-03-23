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
            View = React.createClass({
                _checkIPFormat: function(e) {
                    var me = e.currentTarget,
                        originalIP = config().read('poke-ip-addr'),
                        ip = me.value,
                        lang = args.state.lang,
                        ipv4Pattern = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/g;

                    if (true === ipv4Pattern.test(ip)) {
                        // save ip
                        config().write('poke-ip-addr', ip);
                    }
                    else {
                        me.value = originalIP;
                        AlertActions.showPopupError('laser-upload-error', lang.settings.wrong_ip_format);
                    }

                },

                render : function() {
                    var lang = args.state.lang,
                        pokeIP = config().read('poke-ip-addr');

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
                                    <select className="font3">
                                        <option>None</option>
                                    </select>
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
                        </div>
                    )
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

        return View;
    };
});