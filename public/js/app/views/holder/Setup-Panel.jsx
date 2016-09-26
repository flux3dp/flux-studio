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
    config,
    i18n,
    round,
    ClassNames
) {
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                lang: i18n.get(),
                defaults: {},
                imageFormat: 'svg'  // svg, bitmap
            };
        },

        getInitialState: function() {
            var props = this.props,
                lang = props.lang;

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
                    liftHeight: refs.liftHeight.value(),
                    drawHeight: refs.drawHeight.value(),
                    speed: refs.speed.value()
                },
                state = {
                    defaults: opts
                };

            config().write('draw-defaults', opts);

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
        _renderLiftHeight: function(lang) {
            var min = Math.max(5, this.state.defaults.drawHeight);

            return {
                label: (
                    <div title={lang.draw.pen_up_title}>
                        <span className="caption">{lang.draw.pen_up}</span>
                        <span>{this.state.defaults.liftHeight}</span>
                        <span>{lang.draw.units.mm}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="liftHeight"
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.liftHeight}
                            getValue={this._updateDefaults}
                            min={min}
                            max={150}
                        />
                    </div>
                )
            };
        },

        _renderDrawHeight: function(lang) {
            var max = Math.min(150, this.state.defaults.liftHeight);

            return {
                label: (
                    <div title={lang.draw.pen_down_title}>
                        <span className="caption">{lang.draw.pen_down}</span>
                        <span>{this.state.defaults.drawHeight}</span>
                        <span>{lang.draw.units.mm}</span>
                    </div>
                ),
                content: (
                    <div className="object-height-input">
                        <UnitInput
                            ref="drawHeight"
                            defaultUnit="mm"
                            defaultValue={this.state.defaults.drawHeight}
                            getValue={this._updateDefaults}
                            min={5}
                            max={max}
                        />
                    </div>
                )
            };
        },

        _renderSpeed: function(lang) {
            return {
                label: (
                    <div title={lang.draw.speed_title}>
                        <span className="caption">{lang.draw.speed}</span>
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
                            max={150}
                        />
                    </div>
                )
            };
        },

        render: function() {
            var props = this.props,
                lang = props.lang,
                cx = React.addons.classSet,
                liftHeight = this._renderLiftHeight(lang),
                drawHeight = this._renderDrawHeight(lang),
                speed = this._renderSpeed(lang),
                items = [
                    liftHeight,
                    drawHeight,
                    speed
                ];

            return (
                <div className="setup-panel operating-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }

    });
});