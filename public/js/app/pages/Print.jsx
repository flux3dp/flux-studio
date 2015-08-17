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
], function($, React, display, printController, RadioGroupView, ClassNames, OperatingPanel, SettingPanel, ScalePanel, RotationPanel, AdvancedPanel, MonitorPanel, FileSystem, Modal, PrinterSelector) {
    'use strict';

    return function(args) {
        args = args || {};

        var advancedSetting = {
                infill: 0,
                layerHeight: 0,
                travelingSpeed: 0,
                extrudingSpeed: 0,
                temperature: 0,
                support: ''
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
                        previewMode                 : 'normal',
                        showPreviewModeList         : false,
                        showAdvancedSetting         : false,
                        showMonitor                 : false,
                        modelSelected               : null,
                        openPrinterSelectorWindow   : false
                    });
                },
                componentDidMount: function() {
                    printController.init(this);
                },
                _updateSelectedSize: function() {

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
                            printController.alignCenter();
                            break;
                        case 'delete':
                            printController.removeSelected();
                            this.setState({ operation: '' });
                            break;
                        default:
                            break;
                    }

                },
                _handlePlatformClick: function(state) {
                    console.log('platform clicked', state)
                },
                _handleSupportClick: function(state) {
                    console.log('support clicked', state);
                },
                _handleShowAdvancedSetting: function() {
                    this.setState({ showAdvancedSetting: !this.state.showAdvancedSetting });
                },
                _handlePrintStart: function() {
                    this.setState({
                        openPrinterSelectorWindow: true
                    });
                    // printController.readyGCode();
                    // this.setState({ showMonitor: true });
                },
                _handleRotation: function(rotation) {
                    _rotation = rotation;
                    printController.rotate(rotation.x, rotation.y, rotation.z, true);
                },
                _handleResetRotation: function() {
                    _rotation.x = 0;
                    _rotation.y = 0;
                    _rotation.z = 0;
                    printController.rotate(0, 0, 0, true);
                },
                _handleScaleChange: function(scale) {
                    _scale = scale;
                    printController.setScale(scale.x, scale.y, scale.z, scale.locked, true);
                },
                _handleResetScale: function() {
                    printController.setScale(1, 1, 1, true);
                },
                _handleAdvancedSettingCancel: function() {
                    console.log('advanced setting cancelled');
                    this.setState({ showAdvancedSetting: false });
                },
                _handleAdvancedSettingDone: function(setting) {
                    console.log(setting);
                    advancedSetting = setting;
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
                                        printController.appendModel(fileEntry, file);
                                    }
                                }
                            );
                        })(files.item(i));

                    }
                    e.target.value = null;
                },
                _handleFileDownload: function(e) {
                    var fileName = prompt(lang.print.download_prompt);
                    fileName = fileName || 'no name';
                    printController.downloadGCode(fileName);
                },
                _handlePrinterSelectorWindowClose: function() {
                    this.setState({ openPrinterSelectorWindow: false });
                },
                _handlePrinterSelected: function(selectedPrinter) {
                    console.log(selectedPrinter);
                    this.setState({ openPrinterSelectorWindow: false });
                },
                _renderHeader: function() {
                    return;
                    var currentMode     = this.state.previewMode === 'normal' ? lang.print.normal_preview : lang.print.support_preview,
                        normalClass     = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'normal'}),
                        supportClass    = ClassNames('fa', 'fa-check', 'icon', 'pull-right', {hide: this.state.previewMode !== 'support'}),
                        previewClass    = ClassNames('preview', {hide: !this.state.showPreviewModeList}),
                        boundingBox     = printController.getSelectedObjectSize();
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
                                    <button className="btn btn-default tip" data-tip={lang.print.save} onClick={this._handleFileDownload}>
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
                            onSave                  = {this._handleFileDownload}
                            onPrintStart            = {this._handlePrintStart} />
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
                    var content = <PrinterSelector lang={lang} onClose={this._handlePrinterSelectorWindowClose} onGettingPrinter={this._handlePrinterSelected}/>;
                    return (
                        <Modal {...this.props} content={content} />
                    );
                },
                render: function() {
                    var header                  = this._renderHeader(),
                        operatingPanel          = this._renderOperatingPanel(),
                        settingPanel            = this._renderSettingPanel(),
                        advancedPanel           = this.state.showAdvancedSetting ? this._renderAdvancedPanel() : '',
                        bottomPanel,
                        monitorPanel            = this.state.showMonitor ? this._renderMonitorPanel() : '',
                        printerSelectorWindow   = this.state.openPrinterSelectorWindow ? this._renderPrinterSelectorWindow() : '';

                    switch(this.state.operation) {
                        case 'rotate':
                            bottomPanel = (
                                <RotationPanel
                                    lang={lang}
                                    selected={this.state.modelSelected}
                                    onReset={this._handleResetRotation}
                                    onRotate={this._handleRotation} />
                            );
                            printController.setRotateMode();
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
                            printController.setScaleMode();
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

                            <div id="model-displayer" className="model-displayer" style={divStyle}></div>
                        </div>
                    );
                }
            });

        return view;
    };
});
