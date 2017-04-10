define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Select',
    'app/actions/alert-actions',
    'helpers/local-storage',
    'app/actions/initialize-machine',
], function($, React, i18n, config, SelectView, AlertActions, LocalStorage, initializeMachine) {
    'use strict';

    let Controls = React.createClass({
        innerHtml: function() {
            return {__html: this.props.label};
        },
        render: function() {
            let style = { width: 'calc(100% / 10 * 3 - 10px)' };
            return (
                <div className="row-fluid">

                    <div className="span3 no-left-margin">
                        <label className="font2"
                            dangerouslySetInnerHTML={this.innerHtml()}
                        >
                        </label>
                    </div>

                    <div className="span8 font3">
                        {this.props.children}
                    </div>

                </div>
            );
        }
    });

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
                ips = me.value.split(','),
                ipv4Pattern = /^\d{1,3}[\.]\d{1,3}[\.]\d{1,3}[\.]\d{1,3}$/g,
                isCorrectFormat = true;

            ips.forEach((ip) => {
                if ('' !== ip && typeof ips === 'string' && false === ipv4Pattern.test(ip)) {
                    me.value = originalIP;
                    AlertActions.showPopupError('wrong-ip-error', lang.settings.wrong_ip_format + '\n' + ip);
                    isCorrectFormat = false;
                    return;
                }
            });


            if(isCorrectFormat) {
                config().write('poke-ip-addr', me.value);
            }
        },

        _changeActiveLang: function(e) {
            i18n.setActiveLang(e.currentTarget.value);
            this.setState({
                lang: i18n.get()
            });
            this.props.onLangChange(e);
        },

        _updateOptions: function(id, e) {
            config().write(id, e.target.value);
        },

        _removeDefaultMachine: function() {
            if(confirm(this.state.lang.settings.confirm_remove_default)) {
              initializeMachine.defaultPrinter.clear();
              this.forceUpdate();
            }
        },

        _resetFS: function() {
            if(confirm(this.state.lang.settings.confirm_reset)) {
                LocalStorage.clearAllExceptIP();
                location.hash = '#';
            }
        },


        render: function() {
            let { supported_langs } = this.props,
                printer = initializeMachine.defaultPrinter.get(),
                default_machine_button,
                tableStyle = {width: '70%'},
                pokeIP = config().read('poke-ip-addr'),
                lang = this.state.lang,
                notificationOptions = [],
                projectionOptions = [],
                antialiasingOptions = [],
                defaultModelOptions = [],
                options = [];

            Object.keys(supported_langs).map(l => {
                options.push({
                    value: l,
                    label: supported_langs[l],
                    selected: l === i18n.getActiveLang()
                });
            });

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

            projectionOptions = [
                {
                    value: 'Perspective',
                    label: lang.settings.projection_perspective,
                    selected: config().read('camera-projection') === 'Perspective'
                },
                {
                    value: 'Orthographic',
                    label: lang.settings.projection_orthographic,
                    selected: config().read('camera-projection') === 'Orthographic'
                }
            ];

            antialiasingOptions = [
                {
                    value: 0,
                    label: lang.settings.off,
                    selected: config().read('antialiasing') === '0'
                },
                {
                    value: 1,
                    label: lang.settings.on,
                    selected: config().read('antialiasing') === '1'
                }
            ];


            defaultModelOptions = [
                {
                    value: '',
                    label: lang.settings.none,
                    selected: config().read('default-model') === ''
                },
                {
                    value: 'fd1',
                    label: lang.settings.fd1,
                    selected: config().read('default-model') === 'fd1'
                },
                {
                    value: 'fd1p',
                    label: lang.settings.fd1p,
                    selected: config().read('default-model') === 'fd1p'
                }
            ];

            if (printer.name != undefined) {
              default_machine_button = <a className="font3"
                          onClick={this._removeDefaultMachine}
                        >{lang.settings.remove_default_machine_button}</a>
            } else {
              default_machine_button = <span>{lang.settings.default_machine_button}</span>
            }

            return (
                <div className="form general">

                    <Controls label={lang.settings.language}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={options}
                            onChange={this._changeActiveLang}
                        />
                    </Controls>

                    <Controls label={lang.settings.notifications}>
                        <SelectView
                            className="font3"
                            options={notificationOptions}
                            onChange={this._updateOptions.bind(null, 'notification')}
                        />
                    </Controls>

                    <Controls label={lang.settings.ip}>
                        <input
                            type="text"
                            autoComplete="false"
                            defaultValue={pokeIP}
                            onBlur={this._checkIPFormat}
                        />
                    </Controls>

                    <Controls label={lang.settings.projection}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={projectionOptions}
                            onChange={this._updateOptions.bind(null, 'camera-projection')}
                        />
                    </Controls>

                    <Controls label={lang.settings.antialiasing}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={antialiasingOptions}
                            onChange={this._updateOptions.bind(null, 'antialiasing')}
                        />
                    </Controls>

                    <Controls label={lang.settings.default_model}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={defaultModelOptions}
                            onChange={this._updateOptions.bind(null, 'default-model')}
                        />
                    </Controls>

                    <Controls label={lang.settings.default_machine}>
                      <table style={tableStyle}>
                        <tr>
                          <td>{printer.name}</td>
                          <td>
                            {default_machine_button}
                          </td>
                        </tr>
                      </table>
                    </Controls>

                    <Controls label="">
                        <a className="font3"
                            onClick={this._resetFS}
                        >{lang.settings.reset_now}</a>
                    </Controls>

                </div>
            );
        }

    });

});
