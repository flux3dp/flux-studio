define([
    'react',
    'jsx!widgets/Modal',
    'jsx!widgets/Button-Group',
    'helpers/api/config',
    'plugins/classnames/index',
    'helpers/i18n',
], function(
    React,
    Modal,
    ButtonGroup,
    Config,
    classNames,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel.advanced_panel;
    const config = Config();

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
                engraveDpi: config.read('beambox-preference')['engrave_dpi'],
            };
        }

        _handleEngraveDpiChange(value) {
            this.setState({
                engraveDpi: value
            });
        }

        save() {
            config.update('beambox-preference', 'engrave_dpi', this.state.engraveDpi);
        }

        render() {
            return (
                <Modal onClose={() => this.props.onClose()}>
                    <div className='advanced-panel'>
                        <section className='header'>
                            {LANG.advance_options}
                        </section>
                        <section className='main-content'>
                            <div className='title'>{LANG.engrave_parameters}</div>
                            <EngraveDpiSlider
                                value={this.state.engraveDpi}
                                onChange={val => this._handleEngraveDpiChange(val)}
                            />
                        </section>
                        <section className='footer'>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => this.props.onClose()}
                            >{LANG.cancel}
                            </button>
                            <button
                                className='btn btn-default pull-right'
                                onClick={() => {
                                    this.save();
                                    this.props.onClose();
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
