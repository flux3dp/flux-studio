define([
    'jquery',
    'react',
    'jsx!widgets/Select',
    'jsx!widgets/Modal',
    'jsx!widgets/File-Uploader',
    'jsx!views/laser/Advanced-Panel',
    'helpers/api/config'
], function($, React, SelectView, Modal, FileUploader, AdvancedPanel, config) {
    'use strict';

    return React.createClass({
        _advancedSettings: undefined,

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

        _getSettings: function() {
            var settings = this._advancedSettings;

            if ('undefined' === typeof settings) {
                settings = JSON.parse(JSON.stringify($(this.refs.material.getDOMNode()).find('option:selected').data('meta')));
            }

            delete settings.material;
            settings.object_height = this.refs.objectHeight.getDOMNode().value;
            settings.power = settings.power / 255;

            return settings;
        },

        _onAdvanceDone: function(settings) {
            this._advancedSettings = settings;

            this._toggleAdvancedPanel(false)(settings.material);
        },

        _onRunLaser: function() {
            var settings = this._getSettings();

            this.props.onRunLaser(settings);
        },

        _onExport: function() {
            var settings = this._getSettings();

            this.props.onExport(settings)
        },

        _onObjectHeightBlur: function(e) {
            var value = parseFloat(e.currentTarget.value) || 0;
            e.currentTarget.value = value;

            config().write('laser-object-height', value);
        },

        _renderAdvancedPanel: function(lang, default_material) {
            var content = (
                    <AdvancedPanel
                        lang={lang}
                        materials={this.state.materials}
                        defaultMaterial={default_material}
                        onCancel={this._toggleAdvancedPanel(false)}
                        onDone={this._onAdvanceDone}
                        ref="advancedPanel"
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
                    <button data-ga-event="running-laser" className={laser_class} onClick={this._onRunLaser}>
                        <img src="/img/icon-laser-s.png"/>
                        {mode}
                    </button> :
                    ''
                ),
                importButton = (
                    <div className={import_class}>
                        <lable className="fa fa-plus">{lang.laser.import}</lable>
                        <FileUploader
                            ref="fileUploader"
                            accept="image/*"
                            multiple={true}
                            onReadFileStarted={this.props.uploadProcess.onReadFileStarted}
                            onReadingFile={this.props.uploadProcess.onFileReading}
                            onReadEnd={this.props.uploadProcess.onFileReadEnd}
                            onError={function() {
                                console.log('error');
                            }}
                        />
                    </div>
                ),
                saveButton = (
                    true === props.hasImage ?
                    <button ref="saveas" data-ga-event="save-laser-gcode" className={export_file_class} onClick={this._onExport}>{lang.laser.save}</button> :
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
                <input ref="objectHeight" type="number" min="0" max="100" step="0.1" defaultValue="" readOnly={!this.state.isReady}
                    onBlur={this._onObjectHeightBlur}
                />
            )
        },

        _onReady: function() {
            this.setState({
                isReady: true
            });
        },

        componentWillMount: function () {
            var self = this;

            config().read('custom-material', {
                onFinished: function(response) {
                    var data = JSON.parse(response),
                        materials = self.state.materials,
                        customIndex = materials.findIndex(function(el) {
                            return el.value === 'custom';
                        });

                    data.label = self.props.lang.laser.custom;

                    if (-1 === customIndex) {
                        materials.forEach(function(el) {
                            el.selected = false;
                        });

                        materials.push(data);

                        self.setState({
                            materials: materials
                        });
                    }
                }
            });
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
                            <button
                                data-ga-event="open-laser-advanced-panel"
                                className="btn btn-default btn-full-width"
                                onClick={this._openAdvancedPanel}>
                                {lang.laser.button_advanced}
                            </button>
                        </div>
                    </div>
                    {buttons}

                    {advancedPanel}
                </div>
            );
        },

        componentDidMount: function () {
            var self = this,
                objectHeight = self.refs.objectHeight.getDOMNode(),
                opts = {
                    onError: function(response) {
                        objectHeight.value = 3;
                        self._onReady();
                    }
                }

            config(opts).read('laser-object-height', {
                onFinished: function(response) {
                    objectHeight.value = parseFloat(response, 10);
                    self._onReady();
                }
            });
        },

        getDefaultProps: function() {
            return {
                settingMaterial: React.PropTypes.object,
                uploadProcess: React.PropTypes.object,
                onRunLaser: React.PropTypes.func,
                onExport: React.PropTypes.func,
                hasImage: React.PropTypes.bool,
                mode: React.PropTypes.string
            };
        },

        getInitialState: function() {
            var props = this.props,
                lang = props.lang;

            return {
                openAdvancedPanel: false,
                defaultMaterial: undefined,
                isReady: false,
                materials: lang.laser.advanced.form.object_options.options
            };
        }

    });
});