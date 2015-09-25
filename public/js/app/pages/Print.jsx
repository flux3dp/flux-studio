define([
    'jquery',
    'react',
    'helpers/display',
    'app/actions/print',
    'jsx!widgets/Radio-Group',
    'plugins/classnames/index',
    'jsx!views/print-operating-panels/Advanced',
    'jsx!views/print-operating-panels/Left-Panel',
    'jsx!views/print-operating-panels/Right-Panel',
    'helpers/file-system',
    'jsx!widgets/Modal',
    'jsx!views/Print-Selector',
    'plugins/knob/jquery.knob'
], function($,
    React,
    display,
    director,
    RadioGroupView,
    ClassNames,
    AdvancedPanel,
    LeftPanel,
    RightPanel,
    FileSystem,
    Modal,
    PrinterSelector) {

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
                        openObjectDialogue          : false,
                        openWaitWindow              : false,
                        openImportWindow            : true,
                        sliderMax                   : 1,
                        sliderValue                 : 0,
                        progressMessage             : '',
                        objectDialogueStyle         : {},
                        mode                        : 'rotate',
                        camera                      : {}
                    });
                },
                componentDidMount: function() {
                    director.init(this);
                },
                _updateSelectedSize: function() {

                },
                _handleOperationChange: function(operation) {
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
                    director.setParameter('printSpeed', speed);
                },
                _handleRaftClick: function(state) {
                    director.setParameter('raft', state ? '1' : '0');
                },
                _handleSupportClick: function(state) {
                    director.setParameter('support', state ? '1' : '0');
                },
                _handleToggleAdvancedSettingPanel: function() {
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
                },
                _handlePrintRestart: function(e) {
                },
                _handleImport: function(e) {
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
                _handleDownloadGCode: function(e) {
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
                _handleToggleMode: function(source) {
                    console.log(source);
                    this.setState({ mode: source });
                },
                _handleCameraPositionChange: function(position, rotation) {
                    director.setCameraPosition(position, rotation);
                },
                _renderOperatingPanel: function() {
                    return (
                        <OperatingPanel
                            modelSelected       = {this.state.modelSelected}
                            lang                = {lang}
                            onOperationChange   = {this._handleOperationChange} />
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
                _renderImportWindow: function() {
                    return (
                        <div className="importWindow">
                            <div className="arrowBox">
                                <div className="file-importer">
                                    <div className="import-btn">{lang.print.import}</div>
                                    <input type="file" accept=".stl" onChange={this._handleImport} />
                                </div>
                            </div>
                        </div>
                    );
                },
                _renderLeftPanel: function() {
                    return (
                        <LeftPanel
                            lang                        = {lang}
                            onRaftClick                 = {this._handleRaftClick}
                            onSupportClick              = {this._handleSupportClick}
                            onShowAdvancedSettingPanel  = {this._handleToggleAdvancedSettingPanel} />
                    );
                },
                _renderRightPanel: function() {
                    return (
                        <RightPanel
                            lang                    = {lang}
                            camera                  = {this.state.camera}
                            onPreviewClick          = {this._handlePreview}
                            onPrintClick            = {this._handlePrintClick}
                            onDownloadGCode         = {this._handleDownloadGCode}
                            onCameraPositionChange  = {this._handleCameraPositionChange} />
                    );
                },
                _renderObjectDialogue: function() {
                    var rotateInputFieldsClass = ClassNames('rotateInputFields', {bottom: this.state.mode === 'rotate'}),
                        rotateClass = ClassNames('section', {bottom: this.state.mode === 'scale'});

                    return (
                        <div className="objectDialogue" style={this.state.objectDialogueStyle}>
                            <div id="scale" className="section" onClick={this._handleToggleMode.bind(this, 'scale')}>
                                <div className="title">{lang.print.scale}</div>
                            </div>

                            <div id="rotate" className={rotateClass} onClick={this._handleToggleMode.bind(this, 'rotate')}>
                                <div className="divider"></div>
                                <div className="title">{lang.print.rotate}</div>
                            </div>

                            <div className={rotateInputFieldsClass}>
                                <div className="group">
                                    <div className="label">X</div>
                                    <div className="control"><input type="text" /></div>
                                </div>
                                <div className="group">
                                    <div className="label">Y</div>
                                    <div className="control"><input type="text" /></div>
                                </div>
                                <div className="group">
                                    <div className="label">Z</div>
                                    <div className="control"><input type="text" /></div>
                                </div>
                            </div>
                        </div>
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
                    var advancedPanel           = this.state.showAdvancedSetting ? this._renderAdvancedPanel() : '',
                        importWindow            = this.state.openImportWindow ? this._renderImportWindow() : '',
                        leftPanel               = this._renderLeftPanel(),
                        rightPanel              = this._renderRightPanel(),
                        objectDialogue          = this.state.openObjectDialogue ? this._renderObjectDialogue() : '',
                        bottomPanel,
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

                            {importWindow}

                            {leftPanel}

                            {rightPanel}

                            {objectDialogue}

                            {printerSelectorWindow}

                            {advancedPanel}

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
