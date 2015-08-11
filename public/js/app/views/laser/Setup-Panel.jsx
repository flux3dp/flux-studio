define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Modal',
    'jsx!views/laser/Advanced-Panel'
], function($, React, SelectView, Modal, AdvancedPanel) {
    'use strict';

    return React.createClass({
        _getSelectedMaterial: function(value) {
            var props = this.props,
                lang = props.lang,
                selected_material = lang.laser.advanced.form.object_options.options.filter(
                    function(obj) {
                        return value === obj.value;
                    }
                );

            return (0 < selected_material.length ? selected_material[0] : undefined);
        },

        _toggleAdvancedPanel: function(open) {
            var self = this;

            return function(material_name) {
                material_name = material_name || '';

                self.setState({
                    openAdvancedPanel: open,
                    defaultMaterial: self._getSelectedMaterial(material_name)
                });
            };
        },

        _openAdvancedPanel: function(e) {
            var $material = $(this.refs.material.getDOMNode()),
                selected_value = $material.find('option:selected').val();

            this._toggleAdvancedPanel(true)(selected_value);
        },

        _onDone: function(settings) {
            this.props.getSettings(settings);

            this._toggleAdvancedPanel(false)(settings.material);
        },

        _renderAdvancedPanel: function(lang, default_material) {
            var content = (
                    <AdvancedPanel
                        lang={lang}
                        materials={this.state.materials}
                        defaultMaterial={default_material}
                        onCancel={this._toggleAdvancedPanel(false)}
                        onDone={this._onDone}
                    />
                );

            return (
                true === this.state.openAdvancedPanel ?
                <Modal content={content} onClose={this._toggleAdvancedPanel(false)}/> :
                ''
            );
        },

        render: function() {
            var props = this.props,
                lang = props.lang,
                mode = ('engrave' === props.mode ? lang.laser.start_engrave : lang.laser.start_cut),
                cx = React.addons.classSet,
                button_class = cx({
                    'btn btn-action btn-full-width btn-start': true,
                    'btn-disabled': false === props.hasImage
                }),
                default_material = (
                    this.state.defaultMaterial ||
                    lang.laser.advanced.form.object_options.options.filter(
                        function(obj) {
                            return true === obj.selected;
                        }
                    )[0]
                ),
                advancedPanel = this._renderAdvancedPanel(lang, default_material);

            return (
                <div className="setup-panel operating-panel">
                    <div className="main">
                        <div className="time">1 hr 30min</div>
                        <div className="setup">
                            <div className="icon print-speed"></div>
                            <div className="controls">
                                <div className="label">{lang.laser.advanced.form.object_options.text}</div>
                                <div className="control">
                                    <SelectView
                                        defaultValue={default_material.value}
                                        ref="material"
                                        className="span12"
                                        options={this.state.materials}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="setup">
                            <div className="icon material"></div>
                            <div className="controls">
                                <div className="label">{lang.laser.print_params.object_height.text}</div>
                                <div className="control">
                                    0.3
                                    <span>{lang.laser.print_params.object_height.unit}</span>
                                </div>
                            </div>
                        </div>
                        <div className="setup last-setup">
                            <button className="btn btn-default btn-full-width" onClick={this._openAdvancedPanel}>{lang.laser.advenced}</button>
                        </div>
                    </div>
                    <button id="btn-start" className={button_class}>
                        <img src="/img/icon-laser-s.png"/>
                        {mode}
                    </button>
                    {advancedPanel}
                </div>
            );
        },

        getDefaultProps: function() {
            var self = this;

            return {
                settingMaterial: React.PropTypes.object,
                getSettings: React.PropTypes.func
            };
        },

        getInitialState: function() {
            var props = this.props,
                lang = props.lang;

            return {
                openAdvancedPanel: false,
                defaultMaterial: undefined,
                materials: lang.laser.advanced.form.object_options.options
            };
        }

    });
});