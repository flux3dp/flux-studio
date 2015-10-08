define([
    'jquery',
    'react',
    'plugins/classnames/index'
], function($, React, ClassNames) {
    'use strict';

    var printingProgress,
        temperatureProgress;

    return React.createClass({
        getDefaultProps: function() {
            return {
                onTogglePrintPause  : React.PropTypes.func,
                onPrintCancel       : React.PropTypes.func,
                onPrintRestart      : React.PropTypes.func,
                timeLeft            : React.PropTypes.number,
                objectWeight        : React.PropTypes.number
            };
        },
        getInitialState: function() {
            return {
                desiredTemperature  : 280,
                currentTemperature  : 0,
                printingProgress    : 0,
                printStatus         : false,
                printError          : false
            };
        },
        componentDidMount: function() {
            printingProgress = setInterval(() => {
                this.setState({printingProgress: this.state.printingProgress + 2}, function() {
                    $('.knob').val(this.state.printingProgress).trigger('change');

                    if(this.state.printingProgress >= 100) {
                        clearInterval(printingProgress);
                    }
                });

            }, 100);

            temperatureProgress = setInterval(() => {
                this.setState({currentTemperature: this.state.currentTemperature + 10}, function() {
                    if(this.state.currentTemperature >= this.state.desiredTemperature) {
                        clearInterval(temperatureProgress);
                    }
                });
            }, 30);

            setTimeout(() => {
                this.setState({ printError: true });
            }, 7000);

            $('.knob').knob({
                'min'       : 0,
                'max'       : 100,
                'thickness' : 0.1,
                'width'     : 115,
                'height'    : 115,
                'fgColor'   : '#777',
                'bgcolor'   : '#AAAAAA',
                'format'    : function (value) {
                     return (value || 0) + '%';
                }
            });
        },
        _handleTemperatureChange: function() {
            this.setState({ currentTemperature: 280 });
        },
        _handleTogglePrintPause: function() {
            this.setState({ printPaused: !this.state.printPaused });
            this.props.onTogglePrintPause(!this.state.printPaused);
        },
        _handlePrintCancel: function(e) {
            this.props.onPrintCancel(e);
        },
        _handlePrintRestart: function(e) {
            this.props.onPrintRestart(e);
        },
        render: function() {
            var lang                = this.props.lang,
                temperatureClass    = this.state.currentTemperature >= this.state.desiredTemperature ? 'done' : 'loading',
                knobClass           = ClassNames('knob', {'hide': (this.state.printPaused || this.state.printError)}),
                printStatusClass    = ClassNames('fa fa-pause fa-2x', {'hide': !this.state.printPaused}),
                actionButton        =
                    <div className="pause">
                        <a data-ga-event="print-pause" className="btn btn-confirm" onClick={this._handleTogglePrintPause}>{this.state.printPaused ? lang.print.continue : lang.print.pause}</a></div>;

            if(this.state.printError) {
                printStatusClass = ClassNames('fa fa-exclamation-triangle fa-2x');
                actionButton = <div className="restart"><a data-ga-event="print-restart" className="btn btn-confirm" onClick={this._handlePrintRestart}>{lang.print.restart}</a></div>
            }

            return (
                <div className="flux-monitor">
                    <div className="title">Flux Monitor</div>
                    <div className="temperature">
                        <div className="current-temperature">{this.state.currentTemperature}&#x2103;</div>
                        <div className={temperatureClass} onClick={this._handleTemperatureChange}></div>
                    </div>
                    <div className="temperature-option"></div>
                    <div className="printing-progress">
                        <input className={knobClass} readOnly value={this.state.printingProgress + '%'} />
                        <span className={printStatusClass} onClick={this._handleTogglePrintPause}></span>
                    </div>
                    <div className="printing-info">
                        <span className="time-left"> {`${Math.floor(this.props.timeLeft / 60)} ${lang.print.hour} ${this.props.timeLeft % 60} ${lang.print.minute} `}</span><br/>
                        <span className="object-weight">{this.props.objectWeight} gram</span>
                    </div>
                    <div className="actions pull-right">
                        {actionButton}
                        <div className="cancel"><a data-ga-event="print-cancel" className="btn btn-default" onClick={this._handlePrintCancel}>{lang.print.cancel}</a></div>
                    </div>
                </div>
            );
        }

    });
});
