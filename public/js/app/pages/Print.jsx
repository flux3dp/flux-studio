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
    'jsx!views/print-operating-panels/Advanced',
    'jsx!views/print-operating-panels/Monitor',
    'helpers/file-system',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'plugins/knob/jquery.knob'
], function($, React, display, director, RadioGroupView, ClassNames, OperatingPanel, SettingPanel, ScalePanel, RotationPanel, AdvancedPanel, MonitorPanel, FileSystem, Modal, PrinterSelector) {
    'use strict';

    return function(args) {
        args = args || {};

        var advancedSetting = {
                infill: 0,
                layerHeight: 0,
                travelingSpeed: 0,
                extrudingSpeed: 0,
                temperature: 0,
                support: '',
                advancedSettings: ' '
            },
            _scale = {
                locked  : true,
                x       : 1,
                y       : 1,
                z       : 1
            },
            _rotation = {
                x: 0,
                y: 0,
                z: 0
            },
            lang = args.state.lang,
            view = React.createClass({
                getInitialState: function() {
                    return ({
                        checked                     : false,
                        locked                      : true,
                        operation                   : '',
                        previewMode                 : false,
                        showPreviewModeList         : false,
                        showAdvancedSetting         : false,
                        showMonitor                 : false,
                        modelSelected               : null,
                        openPrinterSelectorWindow   : false,
                        openWaitWindow              : false,
                        sliderMax                   : 1,
                        sliderValue                 : 0,
                        progressMessage             : ''
                    });
                },
                componentDidMount: function() {
                    director.init(this);
                },
                _updateSelectedSize: function() {

                },
                // _handlePreviewModeChange: function(mode, e) {
                //     this.setState({
                //         previewMode: mode,
                //         showPreviewModeList: false
                //     });
                // },
                // _handleShowPreviewSelection: function(e) {
                //     this.setState({ showPreviewModeList: !this.state.showPreviewModeList });
                // },
                _handleOperationChange: function(operation) {
                    // console.log('operation is', operation);
                    switch(operation) {
                        case 'scale':
                            this.setState({ operation: 'scale' });
                            break;
                        case 'rotate':
                            this.setState({ operation: 'rotate' });
                            break;
                        case 'center':
                            director.alignCenter();
                            break;
                        case 'delete':
                            director.removeSelected();
                            this.setState({ operation: '' });
                            break;
                        default:
                            break;
                    }

                },
                _handleSpeedChange: function(speed) {
                    console.log(speed);
                    director.setParameter('printSpeed', speed);
                },
                _handlePlatformClick: function(state) {
                    console.log('platform clicked', state)
                    director.setParameter('raft', state ? '1' : '0');
                },
                _handleSupportClick: function(state) {
                    console.log('support clicked', state);
                    director.setParameter('support', state ? '1' : '0');
                },
                _handleShowAdvancedSetting: function() {
                    this.setState({ showAdvancedSetting: !this.state.showAdvancedSetting });
                },
                _handlePrintClick: function() {
                    this.setState({
                        openPrinterSelectorWindow: true
                    });
                },
                _handleRotation: function(rotation) {
                    _rotation = rotation;
                    director.setRotation(rotation.x, rotation.y, rotation.z, true);
                },
                _handleResetRotation: function() {
                    _rotation.x = 0;
                    _rotation.y = 0;
                    _rotation.z = 0;
                    director.setRotation(0, 0, 0, true);
                },
                _handleScaleChange: function(scale) {
                    _scale = scale;
                    director.setScale(scale.x, scale.y, scale.z, scale.locked, true);
                },
                _handleResetScale: function() {
                    director.setScale(1, 1, 1, true);
                },
                _handleAdvancedSettingCancel: function() {
                    console.log('advanced setting cancelled');
                    this.setState({ showAdvancedSetting: false });
                },
                _handleAdvancedSettingDone: function(setting) {
                    advancedSetting = setting;
                    director.setAdvanceParameter(setting);
                    this.setState({ showAdvancedSetting: false });
                },
                _handleShowMonitor: function(e) {

                },
                _handleTogglePrintPause: function(printPaused) {
                    console.log(printPaused ? 'print paused' : 'continue printing');
                },
                _handlePrintCancel: function(e) {
                    console.log('print cancelled');
                },
                _handlePrintRestart: function(e) {
                    console.log('print restarted');
                },
                _handleFileUpload: function(e) {
                    var files = e.target.files;
                    for (var i = 0; i < files.length; i++) {
                        (function(file) {
                            FileSystem.writeFile(
                                file,
                                {
                                    onComplete: function(e, fileEntry) {
                                        director.appendModel(fileEntry, file);
                                    }
                                }
                            );
                        })(files.item(i));
                    }
                    e.target.value = null;
                },
                _handleSave: function(e) {
                    this.setState({ openWaitWindow: true });
                    var fileName = prompt(lang.print.download_prompt);
                    fileName = fileName || 'no name';

                    director.downloadGCode(fileName).then(() => {
                        this.setState({ openWaitWindow: false });
                    });
                },
                _handlePreview: function(isOn) {
                    director.togglePreview(isOn);
                },
                _handlePrinterSelectorWindowClose: function() {
                    this.setState({ openPrinterSelectorWindow: false });
                },
                _handlePrinterSelected: function(selectedPrinter) {
                    console.log(selectedPrinter);
                    this.setState({
                        openPrinterSelectorWindow: false
                    });
                    director.executePrint(selectedPrinter.serial);
                },
                _handlePreviewLayerChange: function(e) {
                    director.changePreviewLayer(e.target.value);
                    this.setState({ sliderValue: e.target.value });
                },
                _renderHeader: function() {
                    return;
                    var normalClass     = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'normal'}),
                        supportClass    = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'support'}),
                        // previewClass    = ClassNames('preview', {hide: !this.state.showPreviewModeList}),
                        boundingBox     = director.getSelectedObjectSize();
                        boundingBox     = typeof(boundingBox) === 'undefined' ? {x: 0, y: 0, z: 0} : boundingBox.box.size();

                    return (
                        <header className="top-menu-bar">
                            <div id="uploader" className="actions">
                                <div>
                                    <button className="btn btn-default file-importer">
                                        <div className="fa fa-plus"></div>
                                        {lang.print.import}
                                        <input type="file" onChange={this._handleFileUpload} />
                                    </button>
                                </div>
                                <div>
                                    <button className="btn btn-default tip" data-tip={lang.print.save} onClick={this._handleSave}>
                                        <div className="fa fa-floppy-o"></div>
                                    </button>
                                </div>
                                <div>
                                    {Math.round(boundingBox.x * 0.1) + 'mm x ' + Math.round(boundingBox.y * 0.1) + 'mm x ' + Math.round(boundingBox.z * 0.1) + 'mm'}
                                </div>
                            </div>
                        </header>
                    );
                },
                _renderOperatingPanel: function() {
                    return (
                        <OperatingPanel
                            modelSelected       = {this.state.modelSelected}
                            lang                = {lang}
                            onOperationChange   = {this._handleOperationChange} />
                    );
                },
                _renderSettingPanel: function() {
                    return(
                        <SettingPanel
                            lang                    = {lang}
                            onPlatformClick         = {this._handlePlatformClick}
                            onSupportClick          = {this._handleSupportClick}
                            onShowAdvancedSetting   = {this._handleShowAdvancedSetting}
                            onImport                = {this._handleFileUpload}
                            onSave                  = {this._handleSave}
                            onPreview               = {this._handlePreview}
                            onPrintClick            = {this._handlePrintClick}
                            onSpeedChange           = {this._handleSpeedChange} />
                    );
                },
                _renderAdvancedPanel: function() {
                    return (
                        <AdvancedPanel
                            lang        = {lang}
                            setting     = {advancedSetting}
                            onCancel    = {this._handleAdvancedSettingCancel}
                            onDone      = {this._handleAdvancedSettingDone} />
                    );
                },
                _renderMonitorPanel: function() {
                    return (
                        <MonitorPanel
                            lang={lang}
                            timeLeft={90}
                            objectWeight={280.5}
                            onPrintCancel={this._handlePrintCancel}
                            onTogglePrintPause={this._handleTogglePrintPause}
                            onPrintRestart={this._handlePrintRestart} />
                    );
                },
                _renderPrinterSelectorWindow: function() {
                    var content = (
                        <PrinterSelector
                            lang={lang}
                            onClose={this._handlePrinterSelectorWindowClose}
                            onGettingPrinter={this._handlePrinterSelected} />
                    )
                    return (
                        <Modal {...this.props} content={content} />
                    );
                },
                _renderWaitWindow: function() {
                    var spinner = <div className="spinner-flip spinner-reverse"/>;
                    return (
                        <Modal content={spinner} />
                    );
                },
                _renderPreviewWindow: function() {
                    return (
                        <div className="previewPanel">
                            <input className="range" type="range" value={this.state.sliderValue} min="0" max={this.state.sliderMax} onChange={this._handlePreviewLayerChange} />
                            <div>
                                {this.state.sliderValue}
                            </div>
                        </div>
                    );
                },
                _renderProgressWindow: function() {
                    var content = (
                        <div className="progressWindow">
                            <div className="message">
                                {this.state.progressMessage}
                            </div>
                            <div className="spinner-flip spinner-reverse"/>
                        </div>
                    )
                    return (
                        <Modal content={content} />
                    );
                },
                render: function() {
                    var header                  = this._renderHeader(),
                        operatingPanel          = this._renderOperatingPanel(),
                        settingPanel            = this._renderSettingPanel(),
                        advancedPanel           = this.state.showAdvancedSetting ? this._renderAdvancedPanel() : '',
                        bottomPanel,
                        monitorPanel            = this.state.showMonitor ? this._renderMonitorPanel() : '',
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '',
                        waitWindow              = this.state.openWaitWindow ? this._renderWaitWindow() : '',
                        previewWindow           = this.state.previewMode ? this._renderPreviewWindow() : '',
                        progressWindow          = this.state.progressMessage ? this._renderProgressWindow() : '';

                    switch(this.state.operation) {
                        case 'rotate':
                            bottomPanel = (
                                <RotationPanel
                                    lang={lang}
                                    selected={this.state.modelSelected}
                                    onReset={this._handleResetRotation}
                                    onRotate={this._handleRotation} />
                            );
                            director.setRotateMode();
                            break;
                        case 'scale':
                            bottomPanel = (
                                <ScalePanel
                                    lang={lang}
                                    selected={this.state.modelSelected}
                                    onReset={this._handleResetScale}
                                    onScaleChange={this._handleScaleChange}
                                    onToggleLock={this._handleScaleToggleLock} />
                            );
                            director.setScaleMode();
                            break;
                        default:
                            break;
                    }

                    if(!this.state.modelSelected) {
                        bottomPanel = '';
                    }

                    var divStyle = {
                    }

                    return (
                        <div className="studio-container print-studio">

                            {header}

                            {operatingPanel}

                            {settingPanel}

                            {advancedPanel}

                            {bottomPanel}

                            {monitorPanel}

                            {printerSelectorWindow}

                            {waitWindow}

                            {previewWindow}

                            {progressWindow}

                            <div id="model-displayer" className="model-displayer" style={divStyle}></div>
                        </div>
                    );
                }
            });

        return view;
    };
});
