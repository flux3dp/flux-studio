define([
    'jquery',
    'react',
    'app/actions/print',
    'plugins/classnames/index'
], function($, React, printController, ClassNames) {
    'use strict';

    var lang;

    return React.createClass({

        propTypes: {
            lang                        : React.PropTypes.object,
            previewLayerCount           : React.PropTypes.number,
            onQualitySelected           : React.PropTypes.func,
            onRaftClick                 : React.PropTypes.func,
            onSupportClick              : React.PropTypes.func,
            onPreviewClick              : React.PropTypes.func,
            onPreviewLayerChange        : React.PropTypes.func,
            onShowAdvancedSettingPanel  : React.PropTypes.func
        },

        getInitialState: function() {
            return {
                raftOn              : true,
                supportOn           : true,
                previewOn           : false,
                previewCurrentLayer : 0,
                previewLayerCount   : this.props.previewLayerCount,
                quality             : 'HIGH QUALITY',
                color               : 'WHITE'
            };
        },

        componentWillMount: function() {
            lang = this.props.lang.print.left_panel;
            lang.quality = this.props.lang.print.quality;
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                previewLayerCount: nextProps.previewLayerCount || 0
            });

            if(nextProps.previewLayerCount !== this.state.previewLayerCount) {
                this.setState({
                    previewCurrentLayer: nextProps.previewLayerCount
                });
            }
        },

        _closePopup: function() {
            $('.popup-open:checked').removeAttr('checked');
        },

        _handleToggleRaft: function() {
            this.setState({
                raftOn: !this.state.raftOn
            });
            this.props.onRaftClick(!this.state.raftOn);
        },

        _handleToggleSupport: function() {
            this.setState({
                supportOn: !this.state.supportOn
            });
            this.props.onSupportClick(!this.state.supportOn);
        },

        _handleSetColor: function(color) {
            this.setState({ color: color.toUpperCase() });
            this._closePopup();
        },

        _handleSelectQuality: function(quality) {
            this.props.onQualitySelected(quality);
            this.setState({ quality: lang.quality[quality] });
            this._closePopup();
        },

        _handleOpenAdvancedSetting: function(e) {
            this._closePopup();
            this.props.onShowAdvancedSettingPanel();
        },

        _handleOpenPreview: function(e) {
            e.preventDefault();
            if(e.target.type === 'range') { return; }
            var src = this.refs.preview.getDOMNode();
            $(src).prop('checked', !this.state.previewOn);
            this.setState({ previewOn: !this.state.previewOn });
            this.props.onPreviewClick(!this.state.previewOn);
        },

        _handlePreviewLayerChange(e) {
            this.props.onPreviewLayerChange(e.target.value);
            this.setState({
                previewCurrentLayer: e.target.value
            });
        },

        _onOpenSubPopup: function(e) {
            var $me = $(e.currentTarget),
                $popupOpen = $('.popup-open:checked').not($me);

            $popupOpen.removeAttr('checked');
        },

        _renderQuanlity: function() {
            var _quality = ['high', 'good', 'normal', 'quick', 'fast'],
                qualitySelection;

            qualitySelection = _quality.map(function(quality) {
                return (
                    <li onClick={this._handleSelectQuality.bind(null, quality)}>
                        {lang.quality[quality]}
                    </li>
                );
            }.bind(this));

            return (
                <li>
                    <label className="popup-selection">
                        <input className="popup-open" name="popup-open" type="checkbox" onClick={this._onOpenSubPopup}/>
                        <div className="display-text">
                            <p>
                                <span>{this.state.quality}</span>
                            </p>
                        </div>
                        <label className="popup">
                            <svg className="arrow light" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                width="36.8" height="30">
                                <polygon points="0,15 36.8,0 36.8,30"/>
                            </svg>
                            <div className="content quality">
                                <ul>
                                    {qualitySelection}
                                </ul>
                            </div>
                        </label>
                    </label>
                </li>
            );
        },

        _renderMaterialPallet: function() {
            var colors = ['green', 'red', 'black', 'turquoise', 'orange', 'gray', 'blue', 'brown', 'white', 'purple', 'yellow', 'transparent'],
                colorLang = this.props.lang.color,
                colorSet,
                colorClass;

            colorSet = colors.map(function(color) {
                colorClass = ClassNames('color', color);
                return (
                    <div className="set">
                        <div className={colorClass}></div>
                        <div className="description" onClick={this._handleSetColor.bind(null, color)}>{colorLang[color]}</div>
                    </div>
                );
            }.bind(this));

            return (
                <li>
                    <label className="popup-selection">
                        <input className="popup-open" name="popup-open" type="checkbox" onClick={this._onOpenSubPopup}/>
                        <div className="display-text">
                            <p>
                                <span>{this.state.color} PLA</span>
                            </p>
                        </div>
                        <label className="popup">
                            <svg className="arrow dark" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                width="36.8" height="30">
                                <polygon points="0,15 36.8,0 36.8,30"/>
                            </svg>
                            <div className="content color light">
                                <div className="title">PICK THE COLOR OF THE FILAMENT</div>
                                <div className="colorSets">
                                    {colorSet}
                                </div>
                            </div>
                        </label>
                    </label>
                </li>
            );
        },

        _renderRaft: function() {
            return (
                <li onClick={this._handleToggleRaft}>
                    <div>{this.state.raftOn ? lang.raft_on : lang.raft_off}</div>
                </li>
            );
        },

        _renderSupport: function() {
            return (
                <li onClick={this._handleToggleSupport}>
                    <div>{this.state.supportOn ? lang.support_on : lang.support_off}</div>
                </li>
            );
        },

        _renderAdvanced: function() {
            return (
                <li onClick={this._handleOpenAdvancedSetting}>
                    <div>{this.props.lang.print.left_panel.advanced}</div>
                </li>
            );
        },

        _renderPreview: function() {
            return (
                <li onClick={this._handleOpenPreview}>
                    <label className="popup-selection">
                        <input ref="preview" className="popup-open" name="popup-open" type="checkbox" onClick={this._onOpenSubPopup}/>
                        <div className="display-text">
                            <p>
                                <span>{lang.preview}</span>
                            </p>
                        </div>
                        <label className="popup">
                            <svg className="arrow dark" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                width="36.8" height="30">
                                <polygon points="0,15 36.8,0 36.8,30"/>
                            </svg>
                            <div className="content preview">
                                <div className="preview-panel">
                                    <input className="range" type="range" value={this.state.previewCurrentLayer} min="0" max={this.state.previewLayerCount} onChange={this._handlePreviewLayerChange} />
                                    <div className="layer-count">
                                        {this.state.previewCurrentLayer}
                                    </div>
                                </div>
                            </div>
                        </label>
                    </label>
                </li>
            );
        },

        render: function() {
            var quality     = this._renderQuanlity(),
                material    = this._renderMaterialPallet(),
                raft        = this._renderRaft(),
                support     = this._renderSupport(),
                advanced    = this._renderAdvanced(),
                preview     = this._renderPreview();

            return (
                <div className='leftPanel'>
                    <ul>
                        {quality}

                        {material}

                        {raft}

                        {support}

                        {advanced}

                        {preview}
                    </ul>
                </div>
            );
        }
    });
});
