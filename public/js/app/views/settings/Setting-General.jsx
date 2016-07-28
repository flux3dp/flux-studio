define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Select',
    'app/actions/alert-actions'
], function($, React, i18n, config, SelectView, AlertActions) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                lang: {},
                supported_langs: '',
                onLangChange: function() {}
            };
        },

        getInitialState: function() {
            return {
                lang: this.props.lang
            };
        },

        _checkIPFormat: function(e) {
            var me = e.currentTarget,
                lang = this.state.lang,
                originalIP = config().read('poke-ip-addr'),
                ip = me.value,
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

        _changeActiveLang: function(e) {
            i18n.setActiveLang(e.currentTarget.value);
            this.setState({
                lang: i18n.get()
            });
            this.props.onLangChange(e);
        },

        _switchNotification: function(e) {
            config().write('notification', e.currentTarget.value);
        },

        render : function() {
            var pokeIP = config().read('poke-ip-addr'),
                lang = this.state.lang,
                notificationOptions = [],
                options = [];

            for (var lang_code in this.props.supported_langs) {
                options.push({
                    value: lang_code,
                    label: this.props.supported_langs[lang_code],
                    selected: lang_code === i18n.getActiveLang()
                });
            }

            notificationOptions = [
                {
                    value: 0,
                    label: lang.settings.notification_off,
                    selected: config().read('notification') === '0'
                },
                {
                    value: 1,
                    label: lang.settings.notification_on,
                    selected: config().read('notification') === '1'
                }
            ];

            return (
                <div className="form general">

                    <div className="row-fluid">

                        <div className="span3 no-left-margin">
                            <label className="font2">
                                {lang.settings.language}
                            </label>
                        </div>

                        <div className="span8">
                            <SelectView id="select-lang" className="font3" options={options} onChange={this._changeActiveLang}/>
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
                </div>
            );
        }

    });

});
