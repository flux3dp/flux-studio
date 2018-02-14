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

                    <div className="span3 no-left-margin" style={style}>
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

        _updateBeamboxPreference: function(item_key, e) {
            config().update('beambox-preference', item_key, e.target.value);
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
                defaultAppOptions = [],
                projectionOptions = [],
                antialiasingOptions = [],
                autoSlicingOptions = [],
                lockSelectionOptions = [],
                defaultModelOptions = [],
                defaultBeamboxModelOptions = [],
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

            defaultAppOptions = [
                {
                    value: 'print',
                    label: lang.menu.print,
                    selected: config().read('default-app') === 'print'
                },
                {
                    value: 'laser',
                    label: lang.menu.laser,
                    selected: config().read('default-app') === 'laser'
                },
                {
                    value: 'scan',
                    label: lang.menu.scan,
                    selected: config().read('default-app') === 'scan'
                },
                {
                    value: 'draw',
                    label: lang.menu.draw,
                    selected: config().read('default-app') === 'draw'
                },
                {
                    value: 'cut',
                    label: lang.menu.cut,
                    selected: config().read('default-app') === 'cut'
                },
                {
                    value: 'beambox',
                    label: lang.menu.beambox,
                    selected: config().read('default-app') === 'beambox'
                },
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

            autoSlicingOptions = [
                {
                    value: 'true',
                    label: lang.settings.on,
                    selected: config().read('auto-slicing') !== 'false'
                },
                {
                    value: 'false',
                    label: lang.settings.off,
                    selected: config().read('auto-slicing') === 'false'
                }
            ];

            lockSelectionOptions = [
                {
                    value: 'true',
                    label: lang.settings.on,
                    selected: config().read('lock-selection') !== 'false'
                },
                {
                    value: 'false',
                    label: lang.settings.off,
                    selected: config().read('lock-selection') === 'false'
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

            defaultBeamboxModelOptions = [
                {
                    value: '',
                    label: lang.settings.none,
                    selected: config().read('beambox-preference')['model'] === ''
                },
                {
                    value: 'fbb1b',
                    label: 'Beambox',
                    selected: config().read('beambox-preference')['model'] === 'fbb1b'
                },
                {
                    value: 'fbb1p',
                    label: 'Beambox Pro',
                    selected: config().read('beambox-preference')['model'] === 'fbb1p'
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

                    <Controls label={lang.settings.default_app}>
                        <SelectView
                            className="font3"
                            options={defaultAppOptions}
                            onChange={this._updateOptions.bind(null, 'default-app')}
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

                    <Controls label={lang.settings.ip}>
                        <input
                            type="text"
                            autoComplete="false"
                            defaultValue={pokeIP}
                            onBlur={this._checkIPFormat}
                        />
                    </Controls>

                    <div className="subtitle">{lang.settings.delta_series}</div>

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

                    <Controls label={lang.settings.auto_slice}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={autoSlicingOptions}
                            onChange={this._updateOptions.bind(null, 'auto-slicing')}
                        />
                    </Controls>

                    <Controls label={lang.settings.lock_selection}>
                        <SelectView
                            id="select-lang"
                            className="font3"
                            options={lockSelectionOptions}
                            onChange={this._updateOptions.bind(null, 'lock-selected')}
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

                    <div className="subtitle">{lang.settings.beambox_series}</div>
                    
                    <Controls label={lang.settings.default_beambox_model}>
                        <SelectView
                            className="font3"
                            options={defaultBeamboxModelOptions}
                            onChange={this._updateBeamboxPreference.bind(null, 'model')}
                        />
                    </Controls>

                    <Controls label="">
                        <a className="font3"
                            onClick={this._resetFS}
                        ><b>{lang.settings.reset_now}</b></a>
                    </Controls>

                </div>
            );
        }

    });

});
