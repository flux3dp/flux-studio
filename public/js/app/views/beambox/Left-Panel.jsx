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
        lang = i18n.lang;

    return React.createClass({

        getDefaultProps: function() {
            return {
            };
        },

        getInitialState: function() {
            return {
                maxStrength: 10
            };
        },

        _renderMaxStrength: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{lang.beambox.maxStrength}</span>
                        <span> : {parseFloat(Math.round(this.state.maxStrength * 10) / 10).toFixed(1)} {lang.beambox.units.w}</span>
                    </div>
                ),
                content: (
                    <div>
                        <SliderControl
                        id="max_strength"
                        min={1}
                        max={40}
                        step={0.1}
                        default={this.state.maxStrength}
                        onChange={(id, newValue)=>{this.setState({maxStrength: newValue});}} />
                    </div>
                ),
                disable: false
            };
        },

        _renderInsertObject: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>Insert Object</span>
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
                        <span>Preview</span>
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