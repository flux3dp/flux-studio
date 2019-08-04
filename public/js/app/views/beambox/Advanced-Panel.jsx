define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Dropdown-Control',
    'jsx!widgets/Switch-Control',
    'jsx!widgets/Radio-Control',
    'app/actions/beambox/beambox-preference',
    'helpers/i18n',
], function(
    React,
    Modal,
    DropDownControl,
    SwitchControl,
    RadioControl,
    BeamboxPreference,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel.advanced_panel;

    // value is one of low, medium, high
    // onChange() will get one of low, medium, high
    const EngraveDpiSlider = ({value, onChange, onClick}) => {
        const dpiMap = [
            'low',
            'medium',
            'high',
        ];

        const sliderValue = dpiMap.indexOf(value);

        const onSliderValueChange = (e) => {
            const newSliderValue = e.target.value;
            const dpi = dpiMap[newSliderValue];
            onChange(dpi);
        };

        return (
            <div className='controls' onClick={onClick}>
                <div className='control'>
                    <span className='label pull-left'>{LANG.engrave_dpi}</span>
                    <input
                        className='slider'
                        type='range'
                        min={0}
                        max={2}
                        value={sliderValue}
                        onChange={onSliderValueChange}
                    />
                    <input
                        className='value'
                        type='text'
                        value={LANG[value]}
                        disabled={true}
                    />
                </div>
            </div>
        );
    };

    return class AdvancedPanel extends React.PureComponent {
        constructor() {
            super();
            this.state = {
                engraveDpi: BeamboxPreference.read('engrave_dpi'),
                rotaryMode: BeamboxPreference.read('rotary_mode')
            };
        }

        _handleEngraveDpiChange(value) {
            this.setState({
                engraveDpi: value
            });
        }

        _handleRotaryModeChange(value) {
            this.setState({
                rotaryMode: value
            });
            svgCanvas.setRotaryMode(value);
            svgCanvas.runExtensions('updateRotaryAxis');
        }

        save() {
            BeamboxPreference.write('engrave_dpi', this.state.engraveDpi);
            BeamboxPreference.write('rotary_mode', this.state.rotaryMode);
        }

        render() {
            return (
                <Modal onClose={() => this.props.unmount()}>
                    <div className='advanced-panel'>
                        <section className='main-content'>
                            <div className='title'>{LANG.engrave_parameters}</div>
                            <EngraveDpiSlider
                                value={this.state.engraveDpi}
                                onChange={val => this._handleEngraveDpiChange(val)}
                            />
                            <SwitchControl
                                id="rotary_mode"
                                name="rotary_mode"
                                label={LANG.rotary_mode}
                                default={this.state.rotaryMode}
                                onChange={(id, val) => this._handleRotaryModeChange(val)} />
                        </section>
                        <section className='footer'>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.props.unmount()}
                            >{LANG.cancel}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => {
                                    this.save();
                                    this.props.unmount();
                                }}
                            >{LANG.save}
                            </button>
                        </section>
                    </div>
                </Modal>
            );
        }
    };
});
