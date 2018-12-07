/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/api/config',
    'jsx!widgets/Select',
    'jsx!widgets/Unit-Input-v2',
    'app/actions/alert-actions',
    'helpers/local-storage',
    'app/actions/beambox/constant',
    'app/actions/beambox/beambox-preference',
    'app/actions/initialize-machine',
], function(
    $,
    React,
    i18n,
    Config,
    SelectView,
    UnitInput,
    AlertActions,
    LocalStorage,
    BeamboxConstant,
    BeamboxPreference,
    initializeMachine
) {

    const Controls = props => {
        const style = { width: 'calc(100% / 10 * 3 - 10px)' };
        const innerHtml = {__html: props.label};
        return (
            <div className='row-fluid'>
                <div className='span3 no-left-margin' style={style}>
                    <label className='font2'
                        dangerouslySetInnerHTML={innerHtml}
                    />
                </div>
                <div className='span8 font3'>
                    {props.children}
                </div>

            </div>
        );
    };

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
                lang: i18n.lang
            };
        },

        _checkIPFormat: function(e) {
            var me = e.currentTarget,
                lang = this.state.lang,
                originalIP = Config().read('poke-ip-addr'),
                ips = me.value.split(/[,;] ?/),
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
                Config().write('poke-ip-addr', me.value);
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
            Config().write(id, e.target.value);
            this.forceUpdate();
        },

        _updateBeamboxPreference: function(item_key, val) {
            if (val === 'true') {
                val = true;
            } else if (val === 'false') {
                val = false;
            }
            BeamboxPreference.write(item_key, val);
            this.forceUpdate();
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
                pokeIP = Config().read('poke-ip-addr'),
                lang = this.state.lang,
                options = [];

            Object.keys(supported_langs).map(l => {
                options.push({
                    value: l,
                    label: supported_langs[l],
                    selected: l === i18n.getActiveLang()
                });
            });

            const notificationOptions = [
                {
                    value: 0,
                    label: lang.settings.notification_off,
                    selected: Config().read('notification') === '0'
                },
                {
                    value: 1,
                    label: lang.settings.notification_on,
                    selected: Config().read('notification') === '1'
                }
            ];

            const defaultAppOptions = [
                {
                    value: 'print',
                    label: lang.menu.print,
                    selected: Config().read('default-app') === 'print'
                },
                {
                    value: 'laser',
                    label: lang.menu.laser,
                    selected: Config().read('default-app') === 'laser'
                },
                {
                    value: 'scan',
                    label: lang.menu.scan,
                    selected: Config().read('default-app') === 'scan'
                },
                {
                    value: 'draw',
                    label: lang.menu.draw,
                    selected: Config().read('default-app') === 'draw'
                },
                {
                    value: 'cut',
                    label: lang.menu.cut,
                    selected: Config().read('default-app') === 'cut'
                },
                {
                    value: 'beambox',
                    label: lang.menu.beambox,
                    selected: Config().read('default-app') === 'beambox'
                },
            ];

            const projectionOptions = [
                {
                    value: 'Perspective',
                    label: lang.settings.projection_perspective,
                    selected: Config().read('camera-projection') === 'Perspective'
                },
                {
                    value: 'Orthographic',
                    label: lang.settings.projection_orthographic,
                    selected: Config().read('camera-projection') === 'Orthographic'
                }
            ];

            const antialiasingOptions = [
                {
                    value: 0,
                    label: lang.settings.off,
                    selected: Config().read('antialiasing') === '0'
                },
                {
                    value: 1,
                    label: lang.settings.on,
                    selected: Config().read('antialiasing') === '1'
                }
            ];

            const autoSlicingOptions = [
                {
                    value: 'true',
                    label: lang.settings.on,
                    selected: Config().read('auto-slicing') !== 'false'
                },
                {
                    value: 'false',
                    label: lang.settings.off,
                    selected: Config().read('auto-slicing') === 'false'
                }
            ];

            const lockSelectionOptions = [
                {
                    value: 'true',
                    label: lang.settings.on,
                    selected: Config().read('lock-selection') !== 'false'
                },
                {
                    value: 'false',
                    label: lang.settings.off,
                    selected: Config().read('lock-selection') === 'false'
                }
            ];

            const guideSelectionOptions = [
                {
                    value: 'false',
                    label: lang.settings.off,
                    selected: BeamboxPreference.read('show_guides') === false
                },
                {
                    value: 'true',
                    label: lang.settings.on,
                    selected: BeamboxPreference.read('show_guides') !== false
                }
            ];

            const defaultModelOptions = [
                {
                    value: '',
                    label: lang.settings.none,
                    selected: Config().read('default-model') === ''
                },
                {
                    value: 'fd1',
                    label: lang.settings.fd1,
                    selected: Config().read('default-model') === 'fd1'
                },
                {
                    value: 'fd1p',
                    label: lang.settings.fd1p,
                    selected: Config().read('default-model') === 'fd1p'
                }
            ];

            const defaultBeamboxModelOptions = [
                {
                    value: 'fbb1b',
                    label: 'Beambox',
                    selected: BeamboxPreference.read('model') === 'fbb1b'
                },
                {
                    value: 'fbb1p',
                    label: 'Beambox Pro',
                    selected: BeamboxPreference.read('model') === 'fbb1p'
                }
            ];

            if (printer.name !== undefined) {
                default_machine_button = (
                    <a className='font3'
                        onClick={this._removeDefaultMachine}
                    >
                        {lang.settings.remove_default_machine_button}
                    </a>);
            } else {
                default_machine_button = (<span>{lang.settings.default_machine_button}</span>);
            }

            return (
                <div className='form general'>

                    <Controls label={lang.settings.language}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={options}
                            onChange={this._changeActiveLang}
                        />
                    </Controls>

                    <Controls label={lang.settings.notifications}>
                        <SelectView
                            className='font3'
                            options={notificationOptions}
                            onChange={this._updateOptions.bind(null, 'notification')}
                        />
                    </Controls>

                    <Controls label={lang.settings.default_app}>
                        <SelectView
                            className='font3'
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
                            type='text'
                            autoComplete='false'
                            defaultValue={pokeIP}
                            onBlur={this._checkIPFormat}
                        />
                    </Controls>

                    <div className='subtitle'>{lang.settings.delta_series}</div>

                    <Controls label={lang.settings.projection}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={projectionOptions}
                            onChange={this._updateOptions.bind(null, 'camera-projection')}
                        />
                    </Controls>

                    <Controls label={lang.settings.antialiasing}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={antialiasingOptions}
                            onChange={this._updateOptions.bind(null, 'antialiasing')}
                        />
                    </Controls>

                    <Controls label={lang.settings.auto_slice}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={autoSlicingOptions}
                            onChange={this._updateOptions.bind(null, 'auto-slicing')}
                        />
                    </Controls>

                    <Controls label={lang.settings.lock_selection}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={lockSelectionOptions}
                            onChange={this._updateOptions.bind(null, 'lock-selected')}
                        />
                    </Controls>

                    <Controls label={lang.settings.default_model}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={defaultModelOptions}
                            onChange={this._updateOptions.bind(null, 'default-model')}
                        />
                    </Controls>

                    <div className='subtitle'>{lang.settings.beambox_series}</div>

                    <Controls label={lang.settings.default_beambox_model}>
                        <SelectView
                            className='font3'
                            options={defaultBeamboxModelOptions}
                            onChange={e => this._updateBeamboxPreference('model', e.target.value)}
                        />
                    </Controls>

                    <Controls label={lang.settings.guides}>
                        <SelectView
                            id='select-lang'
                            className='font3'
                            options={guideSelectionOptions}
                            onChange={e => this._updateBeamboxPreference('show_guides', e.target.value)}
                        />
                    </Controls>
                    <Controls label={lang.settings.guides_origin}>
                        <span className='font2' style={{marginRight: '10px'}}>X</span>
                        <UnitInput
                            unit='mm'
                            min={0}
                            max={BeamboxConstant.dimension.width/10}
                            defaultValue={BeamboxPreference.read('guide_x0')}
                            getValue={val => this._updateBeamboxPreference('guide_x0', val)}
                            className={{half: true}}
                        />
                        <span className='font2' style={{marginRight: '10px'}}>Y</span>
                        <UnitInput
                            unit='mm'
                            min={0}
                            max={BeamboxConstant.dimension.height/10}
                            defaultValue={BeamboxPreference.read('guide_y0')}
                            getValue={val => this._updateBeamboxPreference('guide_y0', val)}
                            className={{half: true}}
                        />
                    </Controls>

                    <Controls label=''>
                        <a className='font3'
                            onClick={this._resetFS}
                        ><b>{lang.settings.reset_now}</b></a>
                    </Controls>

                </div>
            );
        }

    });

});
