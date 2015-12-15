define([
    'jquery',
    'react',
    'app/actions/print',
    'plugins/classnames/index',
    'helpers/device-master',
    'helpers/api/config',
    'jsx!widgets/Dialog-Menu'
], function($, React, printController, ClassNames, DeviceMaster, Config, DialogMenu) {
    'use strict';

    var lang,
        settings,
        constants;

    settings = {
        raftOn: true,
        supportOn: true
    };

    constants = {
        QUALITY     : 'QUALITY',
        RAFT_ON     : 'RAFT_ON',
        SUPPORT_ON  : 'SUPPORT_ON',
        ADVANCED    : 'ADVANCED',
        PREVIEW     : 'PREVIEW'
    };

    return React.createClass({

        propTypes: {
            lang                        : React.PropTypes.object,
            previewMode                 : React.PropTypes.bool,
            hasObject                   : React.PropTypes.bool,
            hasOutOfBoundsObject        : React.PropTypes.bool,
            previewLayerCount           : React.PropTypes.number,
            onQualitySelected           : React.PropTypes.func,
            onRaftClick                 : React.PropTypes.func,
            onSupportClick              : React.PropTypes.func,
            onPreviewClick              : React.PropTypes.func,
            onPreviewLayerChange        : React.PropTypes.func,
            onShowAdvancedSettingPanel  : React.PropTypes.func
        },

        getInitialState: function() {
            var s = Config().read('left-panel');
            settings = !!s ? s : settings;

            return {
                raftOn              : settings.raftOn,
                supportOn           : settings.supportOn,
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

            // if(!nextProps.hasObject || nextProps.hasOutOfBoundsObject) {
            //     this._closePreview();
            // }
        },

        _closePopup: function() {
            $('.popup-open:checked').removeAttr('checked');
        },

        _handleSetColor: function(color) {
            this.setState({ color: color.toUpperCase() });
            this._closePopup();
        },

        _handleActions: function(source, arg, e) {
            var self = this,
                actions = {

                    'QUALITY': function() {
                        self.props.onQualitySelected(arg);
                        self.setState({ quality: lang.quality[arg] });
                        $('.dialog-opener').prop('checked', false);
                    },

                    'RAFT_ON': function() {
                        self.props.onRaftClick();
                    },

                    'SUPPORT_ON': function() {
                        self.props.onSupportClick();
                    },

                    'ADVANCED': function() {
                        self._closePopup();
                        self.props.onShowAdvancedSettingPanel();
                    },

                    'PREVIEW': function() {
                        if(e.target.type === 'range' || !self.props.hasObject || self.props.hasOutOfBoundsObject) {
                            e.preventDefault();
                            return;
                        }
                        if(self.props.hasObject) {
                            // var src = self.refs.preview.getDOMNode();
                            // $(src).prop('checked', !self.state.previewOn);
                            self.setState({ previewOn: !self.state.previewOn });
                            self.props.onPreviewClick(!self.state.previewOn);
                        }
                    },
                };

            if(source !== constants.PREVIEW) {
                self._closePreview();
            }

            self._closePopup();
            actions[source]();
        },

        _handlePreviewLayerChange: function(e) {
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

        _closePreview: function() {
            this.setState({ previewOn: false });
            this.props.onPreviewClick(false);
        },

        _renderQuanlity: function() {
            var _quality = ['high', 'med', 'low'],
                qualitySelection;

            qualitySelection = _quality.map(function(quality) {
                return (
                    <li onClick={this._handleActions.bind(null, constants.QUALITY, quality)}>
                        {lang.quality[quality]}
                    </li>
                );
            }.bind(this));

            return {
                label: (
                    <div className="display-text quality-select">
                        <span>{this.state.quality}</span>
                    </div>
                ),
                content: (
                    <div className="content quality">
                        <ul>
                            {qualitySelection}
                        </ul>
                    </div>
                )
            }
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
                            <svg className="arrow light" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                width="36.8" height="30">
                                <polygon points="0,15 36.8,0 36.8,30"/>
                            </svg>
                            <div className="content color light">
                                <div className="title">{lang.plaTitle}</div>
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
            return {
                label: (
                    <div title={lang.raftTitle} onClick={this._handleActions.bind(null, constants.RAFT_ON, '')}>
                        <div>{this.props.raftOn ? lang.raft_on : lang.raft_off}</div>
                    </div>
                )
            };
        },

        _renderSupport: function() {
            return {
                label: (
                    <div title={lang.supportTitle} onClick={this._handleActions.bind(null, constants.SUPPORT_ON, '')}>
                        <div>{this.props.supportOn ? lang.support_on : lang.support_off}</div>
                    </div>
                )
            };
        },

        _renderAdvanced: function() {
            return {
                label: (
                    <div title={lang.advancedTitle} onClick={this._handleActions.bind(null, constants.ADVANCED, '')}>
                        <div>{this.props.lang.print.left_panel.advanced}</div>
                    </div>
                )
            };
        },

        _renderPreview: function() {
            return {
                label: (
                    <div className="display-text" onClick={this._handleActions.bind(null, constants.PREVIEW, '')}>
                        <span>{lang.preview}</span>
                    </div>
                ),
                content: (
                    <div className="preview-panel">
                        <input ref="preview" className="range" type="range" value={this.state.previewCurrentLayer} min="0" max={this.state.previewLayerCount} onChange={this._handlePreviewLayerChange} />
                        <div className="layer-count">
                            {this.state.previewCurrentLayer}
                        </div>
                    </div>
                )
            };
        },

        render: function() {
            var quality     = this._renderQuanlity(),
                raft        = this._renderRaft(),
                support     = this._renderSupport(),
                advanced    = this._renderAdvanced(),
                preview     = this._renderPreview(),
                items = [
                    quality,
                    raft,
                    support,
                    advanced,
                    preview
                ];

            return (
                <div className='leftPanel'>
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }
    });
});
