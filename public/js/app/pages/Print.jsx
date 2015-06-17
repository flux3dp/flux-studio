define([
    'jquery',
    'react',
    'helpers/display',
    'app/actions/print',
    'jsx!widgets/Radio-Group',
    'plugins/classnames/index',
    'jsx!views/print-operating-panels/Operation',
    'jsx!views/print-operating-panels/Setting',
    'jsx!views/print-operating-panels/Scale',
    'jsx!views/print-operating-panels/Rotation',
    'plugins/knob/jquery.knob.min'
], function($, React, display, printEvents, RadioGroupView, ClassNames, OperatingPanel, SettingPanel, ScalePanel, RotationPanel) {
    'use strict';

    return function(args) {
        args = args || {};

        var lang = args.state.lang,
            view = React.createClass({
                getInitialState: function() {
                    return ({
                        checked             : false,
                        locked              : true,
                        operation           : 'scale',
                        previewMode         : 'normal',
                        showPreviewModeList     : false
                    });
                },
                componentDidMount: function() {
                    printEvents(args);
                    $('#uploader').find('.btn').hover(function(e) {
                        $(this).find('.fa-plus').toggleClass('rotate');
                    });
                },
                _handlePreviewModeChange: function(mode, e) {
                    this.setState({
                        previewMode: mode,
                        showPreviewModeList: false
                    });
                },
                _handleShowPreviewSelection: function(e) {
                    this.setState({ showPreviewModeList: !this.state.showPreviewModeList });
                },
                _handleNavUp: function() {
                    console.log('up');
                },
                _handleNavRight: function() {
                    console.log('right');
                },
                _handleNavDown: function() {
                    console.log('down');
                },
                _handleNavLeft: function() {
                    console.log('left');
                },
                _handleNavHome: function() {
                    console.log('home');
                },
                _handleZoomIn: function() {
                    console.log('zoom in');
                },
                _handleZoomOut: function() {
                    console.log('zoom out');
                },
                _handleOperationChange: function(operation) {
                    console.log('operation is', operation);
                    this.setState({ operation: operation });
                },
                _handlePlatformClick: function(state) {
                    console.log('platform clicked', state)
                },
                _handleSupportClick: function(state) {
                    console.log('support clicked', state);
                },
                _handleShowAdvancedSetting: function() {
                    console.log('show advanced setting');
                },
                _handlePrintStart: function() {
                    console.log('start printing');
                },
                _handleResetRotation: function() {
                    'rotation resetted'
                },
                _handleResetScale: function() {
                    console.log('reset scale');
                },
                _handleScaleToggleLock: function(state) {
                    console.log('lock', state);
                },
                _renderHeader: function() {
                    var currentMode     = this.state.previewMode === 'normal' ? lang.print.normal_preview : lang.print.support_preview,
                        normalClass     = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'normal'}),
                        supportClass    = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'support'}),
                        previewClass    = ClassNames('preview', {hide: !this.state.showPreviewModeList});

                    return (
                        <header>
                            <div id="uploader" className="actions">
                                <div>
                                    <button className="btn btn-default-light">
                                        <span className="fa fa-plus"></span>
                                        {lang.print.import}
                                    </button>
                                </div>
                                <div>
                                    <button className="btn btn-default-light tip" data-tip={lang.print.go_home}>
                                        <span className="fa fa-home"></span>
                                    </button>
                                </div>
                                <div>
                                    <button className="btn btn-default-light tip" data-tip={lang.print.save}>
                                        <span className="fa fa-floppy-o"></span>
                                    </button>
                                </div>
                            </div>

                            <div className="pull-right">
                                <span className="fa fa-print icon"></span>
                                <span>{lang.print.quick_print}</span>
                                <span className="fa fa-caret-down icon"></span>
                            </div>

                            <div className="pull-right preview-container" onClick={this._handleShowPreviewSelection}>
                                <span className="fa fa-eye icon"></span>
                                <span>{currentMode}</span>
                                <span className="fa fa-caret-down icon"></span>
                                <ul className={previewClass}>
                                    <li onClick={this._handlePreviewModeChange.bind(null, 'support')}>
                                        <div>
                                            {lang.print.support_preview} <span className={supportClass}></span>
                                        </div></li>
                                    <li onClick={this._handlePreviewModeChange.bind(null, 'normal')}>
                                        <div>
                                            {lang.print.normal_preview} <span className={normalClass}></span>
                                        </div></li>
                                </ul>
                            </div>
                        </header>
                    );
                },
                render : function() {
                    var header          = this._renderHeader(),
                        operatingPanel,
                        settingPanel,
                        bottomPanel;

                    operatingPanel = <OperatingPanel
                                        lang                = {lang}
                                        onNavUp             = {this._handleNavUp}
                                        onNavRight          = {this._handleNavRight}
                                        onNavDown           = {this._handleNavDown}
                                        onNavLeft           = {this._handleNavLeft}
                                        onNavHome           = {this._handleNavHome}
                                        onZoomIn            = {this._handleZoomIn}
                                        onZoomOut           = {this._handleZoomOut}
                                        onOperationChange   = {this._handleOperationChange} />;


                    settingPanel = <SettingPanel
                                        lang                    = {lang}
                                        onPlatformClick         = {this._handlePlatformClick}
                                        onSupportClick          = {this._handleSupportClick}
                                        onShowAdvancedSetting   = {this._handleShowAdvancedSetting}
                                        onPrintStart            = {this._handlePrintStart} />;

                    switch(this.state.operation) {
                        case 'rotate':
                            bottomPanel = <RotationPanel lang={lang} onReset={this._handleResetRotation} />
                            break;
                        default:
                            bottomPanel = <ScalePanel lang={lang} onReset={this._handleResetScale} onToggleLock={this._handleScaleToggleLock} />
                            break;
                    }

                    return (
                        <div className="studio-container print-studio">

                            {header}

                            {operatingPanel}

                            {settingPanel}

                            {bottomPanel}

                            <div id="model-displayer" className="model-displayer"></div>
                        </div>
                    );
                }
            });

        return view;
    };
});