define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/print',
    'plugins/classnames/index',
    'helpers/device-master',
    'helpers/api/config',
    'jsx!widgets/Dialog-Menu',
    'app/constants/global-constants',
    'app/actions/alert-actions'
], function($, React, PropTypes, printController, ClassNames, DeviceMaster, Config, DialogMenu, GlobalConstants, AlertActions) {
    'use strict';

    var DEFAULT_QUALITY = 'high',
        DEFAULT_MODEL  = 'fd1';

    var lang,
        constants,
        displayModelControl;

    constants = {
        MODEL       : 'MODEL',
        QUALITY     : 'QUALITY',
        RAFT_ON     : 'RAFT_ON',
        SUPPORT_ON  : 'SUPPORT_ON',
        ADVANCED    : 'ADVANCED',
        PREVIEW     : 'PREVIEW'
    };

    return React.createClass({

        propTypes: {
            lang                        : PropTypes.object,
            enable                      : PropTypes.bool,
            previewMode                 : PropTypes.bool,
            previewModeOnly             : PropTypes.bool,
            disablePreview              : PropTypes.bool,
            displayModelControl         : PropTypes.bool,
            hasObject                   : PropTypes.bool,
            hasOutOfBoundsObject        : PropTypes.bool,
            previewLayerCount           : PropTypes.number,
            raftLayers                  : PropTypes.number,
            supportOn                   : PropTypes.bool,
            raftOn                      : PropTypes.bool,
            onQualitySelected           : PropTypes.func,
            onRaftClick                 : PropTypes.func,
            onSupportClick              : PropTypes.func,
            onPreviewClick              : PropTypes.func,
            onPreviewLayerChange        : PropTypes.func,
            onShowAdvancedSettingPanel  : PropTypes.func,
            onValueChange               : PropTypes.func
        },

        getInitialState: function() {
            return {
                raftOn              : true,
                supportOn           : true,
                previewOn           : false,
                previewCurrentLayer : 0,
                previewLayerCount   : this.props.previewLayerCount,
                displayModelControl : true,
                quality             : DEFAULT_QUALITY,
                model               : DEFAULT_MODEL,
                color               : 'WHITE'
            };
        },

        componentWillMount: function() {
            lang = this.props.lang.print.left_panel;
            lang.quality = this.props.lang.print.quality;
            lang.model = this.props.lang.print.model;
        },

        componentDidMount: function() {
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

            this.setState({ quality: nextProps.quality });
            this.setState({ model: nextProps.model });
            this.setState({ displayModelControl: nextProps.displayModelControl });

            if(nextProps.previewMode !== this.state.previewOn) {
                this.setState({ previewOn: nextProps.previewMode });
            }
        },

        _closePopup: function() {
            $('.popup-open:checked').removeAttr('checked');
        },

        _handleSetColor: function(color) {
            this.setState({ color: color.toUpperCase() });
            this._closePopup();
        },

        _handleActions: function(source, arg, e) {
            if(this.props.previewModeOnly === true) {
                e.preventDefault();
                if(source === 'PREVIEW') {
                    $('#preview').parents('label').find('input').prop('checked',true);
                    AlertActions.showPopupYesNo(GlobalConstants.EXIT_PREVIEW, lang.confirmExitFcodeMode);
                }
                return;
            }
            var self = this,
                actions = {
                    'MODEL': function() {
                        self.props.onQualityModelSelected(self.state.quality, arg);
                        $('.dialog-opener').prop('checked', false);
                    },

                    'QUALITY': function() {
                        self.props.onQualityModelSelected(arg, self.state.model);
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
                        if(e.target.type === 'range' || !self.props.hasObject || self.props.disablePreview) {
                            e.preventDefault();
                            return;
                        }
                        if(self.props.hasObject) {
                            self.setState({ previewOn: !self.state.previewOn }, function() {
                                self.props.onPreviewClick(self.state.previewOn);
                            });
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

        _renderQuality: function() {
            var _quality = ['high', 'med', 'low'],
                _class = ClassNames('display-text quality-select', {'disable': this.props.previewModeOnly}),
                qualitySelection;

            qualitySelection = _quality.map(function(quality) {
                return (
                    <li key={Math.random()} onClick={this._handleActions.bind(null, constants.QUALITY, quality)}>
                        {lang.quality[quality]}
                    </li>
                );
            }.bind(this));

            return {
                label: (
                    <div className={_class}>
                        <span>{lang.quality[this.state.quality]}</span>
                    </div>
                ),
                content: (
                    <ul>
                        {qualitySelection}
                    </ul>
                ),
                disable: this.props.previewModeOnly
            };
        },

        _renderModel: function() {
            var _class = ClassNames('display-text model-select', {'disable': this.props.previewModeOnly}),
                modelSelection;

            modelSelection = ['fd1', 'fd1p'].map(function(model) {
                return (
                    <li key={Math.random()} onClick={this._handleActions.bind(null, constants.MODEL, model)}>
                        {lang.model[model]}
                    </li>
                );
            }.bind(this));

            return {
                label: (
                    <div className={_class}>
                        <span>{lang.model[this.state.model]}</span>
                    </div>
                ),
                content: (
                    <ul>
                        {modelSelection}
                    </ul>
                ),
                disable: this.props.previewModeOnly
            };
        },

        _renderRaft: function() {
            var _class = ClassNames('raft', {'disable': !this.props.enable});
            return {
                label: (
                    <div className={_class} title={lang.raftTitle} onClick={this._handleActions.bind(null, constants.RAFT_ON, '')}>
                        <div>{this.props.raftOn ? lang.raft_on : lang.raft_off}</div>
                    </div>
                ),
                disable: this.props.previewModeOnly
            };
        },

        _renderSupport: function() {
            var _class = ClassNames('support', {'disable': !this.props.enable});
            return {
                label: (
                    <div className={_class} title={lang.supportTitle} onClick={this._handleActions.bind(null, constants.SUPPORT_ON, '')}>
                        <div>{this.props.supportOn ? lang.support_on : lang.support_off}</div>
                    </div>
                ),
                disable: this.props.previewModeOnly
            };
        },

        _renderAdvanced: function() {
            var _class = ClassNames('advanced', {'disable': !this.props.enable || this.props.previewModeOnly});
            return {
                label: (
                    <div className={_class} title={lang.advancedTitle} onClick={this._handleActions.bind(null, constants.ADVANCED, '')}>
                        <div>{this.props.lang.print.left_panel.advanced}</div>
                    </div>
                ),
                disable: this.props.previewModeOnly
            };
        },

        _renderPreview: function() {
            var _class = ClassNames('display-text preview', {'disable': !this.props.enable && !this.props.previewModeOnly});
            return {
                label: (
                    <div id="preview" className={_class} onClick={this._handleActions.bind(null, constants.PREVIEW, '')}>
                        <span>{lang.preview}</span>
                    </div>
                ),
                content: (
                    <div className="preview-panel">
                        <input ref="preview" className="range" type="range" min="0" max={this.state.previewLayerCount} onChange={this._handlePreviewLayerChange} />
                        <div className="layer-count">
                            {this.state.previewCurrentLayer}
                        </div>
                    </div>
                )
            };
        },

        render: function() {
            let items = [
                    this._renderQuality(),
                    this._renderRaft(),
                    this._renderSupport(),
                    this._renderAdvanced(),
                    this._renderPreview()
                ],
                mask = this.props.enable || this.props.previewModeOnly ? '' : (<div className="mask"></div>);

            if (this.state.displayModelControl) items.unshift(this._renderModel());

            return (
                <div className='leftPanel'>
                    {mask}
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }
    });
});
