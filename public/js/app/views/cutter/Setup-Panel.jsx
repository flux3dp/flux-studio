define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/List',
    'jsx!widgets/Modal',
    'jsx!views/laser/Advanced-Panel',
    'jsx!widgets/Text-Toggle',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Button-Group',
    'jsx!widgets/Alert',
    'jsx!widgets/Dialog-Menu',
    'helpers/api/config',
    'helpers/i18n',
    'helpers/round',
    'plugins/classnames/index'
], function(
    $,
    React,
    SelectView,
    List,
    Modal,
    AdvancedPanel,
    TextToggle,
    UnitInput,
    ButtonGroup,
    Alert,
    DialogMenu,
    ConfigHelper,
    i18n,
    round,
    ClassNames
) {
    'use strict';

    let Config = ConfigHelper(),
        lang = i18n.lang;

    return React.createClass({

        getDefaultProps: function() {
            return {
                defaults: {},
                imageFormat: 'svg'  // svg, bitmap
            };
        },

        getInitialState: function() {
            return {
                defaults: this.props.defaults
            };
        },

        isShading: function() {
            return false;
        },

        // UI Events
        _saveLastestSet: function() {
            var self = this,
                refs = self.refs,
                opts = {
                    zOffset: refs.zOffset.value(),
                    //overcut: refs.overcut.value(),
                    speed: refs.speed.value(),
                    bladeRadius: refs.bladeRadius.value()
                },
                state = {
                    defaults: opts
                };

            Config.write('cut-defaults', opts);

            self.setState(state);
        },

        openSubPopup: function(e) {
            this.refs.dialogMenu.toggleSubPopup(e);
        },

        _updateDefaults: function(e, value) {
            this._saveLastestSet();
            this.openSubPopup(e);
        },

        // Lifecycle
        _renderZOffset: function() {
            var min = -1;

            return {
                label: (
                    <div title={lang.cut.zOffsetTip}>
                        <span className="caption">{lang.cut.zOffset}</span>
                        <span>{this.state.defaults.zOffset}</span>
                        <span>{lang.draw.units.mm}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="zOffset"
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.zOffset}
                            getValue={this._updateDefaults}
                            min={min}
                            max={5}
                        />
                    </div>
                )
            };
        },

        _renderOvercut: function() {
            return {
                label: (
                    <div title={lang.cut.overcutTip}>
                        <span className="caption">{lang.cut.overcut}</span>
                        <span>{this.state.defaults.overcut}</span>
                        <span>{lang.draw.units.mm}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="overcut"
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.overcut}
                            getValue={this._updateDefaults}
                            min={0}
                            max={10}
                        />
                    </div>
                )
            };
        },

        _renderSpeed: function() {
            return {
                label: (
                    <div title={lang.cut.speedTip}>
                        <span className="caption">{lang.cut.speed}</span>
                        <span>{this.state.defaults.speed}</span>
                        <span>{lang.draw.units.mms}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="speed"
                            defaultUnit="mm/s"
                            defaultUnitType="speed"
                            defaultValue={this.state.defaults.speed}
                            getValue={this._updateDefaults}
                            min={0.8}
                            max={200}
                        />
                    </div>
                )
            };
        },

         _renderBladeRadius: function() {

            return {
                label: (
                    <div title={lang.cut.bladeRadiusTip}>
                        <span className="caption">{lang.cut.bladeRadius}</span>
                        <span>{this.state.defaults.bladeRadius}</span>
                        <span>{lang.draw.units.mm}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="bladeRadius"
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.bladeRadius}
                            getValue={this._updateDefaults}
                            min={0}
                            max={3}
                        />
                    </div>
                )
            };
        },

        render: function() {
            let items = [
                    this._renderZOffset(),
                    // this._renderOvercut(),
                    this._renderSpeed(),
                    this._renderBladeRadius()
                ];

            return (
                <div className="setup-panel operating-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }

    });
});