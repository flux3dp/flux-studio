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

        _onObjectHeightBlur: function(e) {
            e.currentTarget.value = parseFloat(e.currentTarget.value) || 0;
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

        _renderButtons: function(lang) {
            var props = this.props,
                cx = React.addons.classSet,
                mode = ('engrave' === props.mode ? lang.laser.start_engrave : lang.laser.start_cut),
                laser_class = cx({
                    'btn btn-action btn-full-width btn-start': true
                }),
                import_class = cx({
                    'btn btn-action btn-full-width file-importer': true
                }),
                export_file_class = cx({
                    'btn btn-action btn-full-width fa fa-floppy-o': true
                }),
                laserButton = (
                    true === props.hasImage ?
                    <button id="btn-start" className={laser_class}>
                        <img src="/img/icon-laser-s.png"/>
                        {mode}
                    </button> :
                    ''
                ),
                importButton = (
                    <div className={import_class}>
                        <lable className="fa fa-plus">{lang.laser.import}</lable>
                        <input type="file" accept="image/*" multiple/>
                    </div>
                ),
                saveButton = (
                    true === props.hasImage ?
                    <button className={export_file_class}>{lang.laser.save}</button> :
                    ''
                );

            return (
                <div className="action-buttons">
                    {laserButton}
                    {importButton}
                    {saveButton}
                </div>
            );
        },

        _renderObjectHeight: function(lang) {
            return (
                <input type="number" min="0" max="100" step="0.1" defaultValue="0.3" onBlur={this._onObjectHeightBlur}/>
            )
        },

        render: function() {
            var props = this.props,
                lang = props.lang,
                cx = React.addons.classSet,
                buttons = this._renderButtons(lang),
                default_material = (
                    this.state.defaultMaterial ||
                    lang.laser.advanced.form.object_options.options.filter(
                        function(obj) {
                            return true === obj.selected;
                        }
                    )[0]
                ),
                advancedPanel = this._renderAdvancedPanel(lang, default_material),
                objectHeight = this._renderObjectHeight(lang);

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
                                    {objectHeight}
                                    <span>{lang.laser.print_params.object_height.unit}</span>
                                </div>
                            </div>
                        </div>
                        <div className="setup last-setup">
                            <button className="btn btn-default btn-full-width" onClick={this._openAdvancedPanel}>{lang.laser.advenced}</button>
                        </div>
                    </div>
                    {buttons}

                    {advancedPanel}
                </div>
            );
        },

        getDefaultProps: function() {
            return {
                settingMaterial: React.PropTypes.object,
                getSettings: React.PropTypes.func,
                hasImage: React.PropTypes.bool
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