define([
    'react',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dialog-Menu',
    'jsx!views/beambox/Insert-Object-Submenu',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    UnitInput,
    SliderControl,
    DialogMenu,
    InsertObjectSubmenu,
    FnWrapper,
    ConfigHelper,
    i18n
) {
    'use strict';

    let Config = ConfigHelper(),
        LANG = i18n.lang.beambox.left_panel;

    return React.createClass({

        getDefaultProps: function() {
            return {
            };
        },

        getInitialState: function() {
            const options = Config.read('beambox-defaults');
            return {
                maxStrength: options['max-strength']
            };
        },

        _handleMaxStrengthChange: function(newValue) {
            const options = Config.read('beambox-defaults');
            options['max-strength'] = newValue;
            Config.write('beambox-defaults', options);
            this.setState({maxStrength: newValue});
        },

        _renderMaxStrength: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{LANG.max_strength}</span>
                        <span> : {parseFloat(Math.round(this.state.maxStrength * 10) / 10).toFixed(1)} {i18n.lang.beambox.units.walt}</span>
                    </div>
                ),
                content: (
                    <div>
                        <SliderControl
                        id="max_strength"
                        min={1}
                        max={40}
                        step={0.1}
                        default={Number(this.state.maxStrength)}
                        onChange={(id, newValue)=>{this._handleMaxStrengthChange(newValue)}}/>
                    </div>
                ),
                disable: false
            };
        },

        _renderInsertObject: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{LANG.insert_object}</span>
                    </div>
                ),
                content: (
                    <InsertObjectSubmenu />
                ),
                disable: false
            };
        },

        _renderPreview: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{LANG.preview}</span>
                    </div>
                ),
                disable: false
            };

        },

        render: function() {
            let items = [
                    this._renderInsertObject(),
                    this._renderMaxStrength(),
                    this._renderPreview()
                ];

            return (
                <div className="left-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }

    });
});