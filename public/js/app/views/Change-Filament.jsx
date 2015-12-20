define([
    'jquery',
    'react',
    'helpers/i18n',
    'helpers/shortcuts',
    'jsx!widgets/Modal',
    'jsx!widgets/Alert'
], function($, React, i18n, shortcuts, Modal, Alert) {
    'use strict';

    var lang = i18n.get(),
        steps = {
            HOME      : 'HOME',
            GUIDE     : 'GUIDE',
            HEATING   : 'HEATING',
            EMERGING  : 'EMERGING',
            UNLOADING : 'UNLOADING',
            COMPLETED : 'COMPLETED'
        },
        types = {
            LOAD   : 'LOAD',
            UNLOAD : 'UNLOAD'
        },
        View = React.createClass({

            propTypes: {
                open    : React.PropTypes.bool,
                device  : React.PropTypes.object,
                onClose : React.PropTypes.func
            },

            getDefaultProps: function() {
                return {
                    open    : false,
                    device  : {},
                    onClose : function() {}
                };
            },

            getInitialState: function() {
                return {
                    type: '',
                    currentStep: steps.HOME,
                    temperature: 0
                };
            },

            componentWillUpdate: function(nextProps, nextState) {
                if (true === nextProps.open && false === this.props.open) {
                    this.setState(this.getInitialState());
                }
            },

            _onClose: function(e) {
                this.props.onClose(e);
                React.unmountComponentAtNode(this.refs.modal.getDOMNode().parentNode);
            },

            _onStop: function() {
                // TODO: to be implement
                console.log('stop');
            },

            _onEmerging: function() {
                // TODO: to be implement
                console.log('emerging');
            },

            _onUnloading: function() {
                // TODO: to be implement
                console.log('unloading');
            },

            _next: function(nextStep, type) {
                this.setState({
                    type: type || this.state.type,
                    currentStep: nextStep
                });
            },

            _makeCaption: function(caption) {
                if ('undefined' === typeof caption) {
                    caption = (
                        types.LOAD === this.state.type ?
                        lang.change_filament.load_filament :
                        lang.change_filament.unload_filament
                    );
                }

                return caption + ' - ' + (this.props.device.name || '');
            },

            // sections
            _sectionHome: function() {
                return {
                    caption: lang.change_filament.home_caption,
                    message: (
                        <div className="way-to-go">
                            <button className="btn btn-default" data-ga-event="load-filament" onClick={this._next.bind(null, steps.GUIDE, types.LOAD)}>
                                {lang.change_filament.load_filament_caption}
                            </button>
                            <button className="btn btn-default" data-ga-event="unload-filament" onClick={this._next.bind(null, steps.HEATING, types.UNLOAD)}>
                                {lang.change_filament.unload_filament_caption}
                            </button>
                        </div>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        className: 'btn-default btn-alone-left',
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    }]
                };
            },

            _sectionGuide: function() {
                return {
                    message: (
                        <img className="guide-image" src="/img/change-filament-guide.png"/>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    },
                    {
                        label: lang.change_filament.next,
                        dataAttrs: {
                            'ga-event': 'heatup'
                        },
                        onClick: this._next.bind(null, steps.HEATING, '')
                    }]
                };
            },

            _sectionHeating: function() {
                // TODO: unloading start
                var self = this,
                    nextStep = (self.state.type === types.LOAD ? steps.EMERGING : steps.UNLOADING);
                setTimeout(function() {
                    self._next(nextStep);
                }, 3000);

                return {
                    message: (
                        <div className="message-container">
                            <p>
                                <span>{lang.change_filament.heating_nozzle}</span>
                                <span>({this.state.temperature})</span>
                            </p>
                            <div className="spinner-roller spinner-roller-reverse"/>
                        </div>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        className: 'btn-default btn-alone-left',
                        dataAttrs: {
                            'ga-event': 'stop-heating'
                        },
                        onClick: this.props.onClose
                    }]
                };
            },

            _sectionEmerging: function() {
                // TODO: unloading start
                var self = this;
                setTimeout(function() {
                    self._next(steps.COMPLETED);
                }, 3000);

                var emergingText = lang.change_filament.emerging.map(function(text) {
                    return (<p>{text}</p>);
                });

                return {
                    message: (
                        <div className="message-container">
                            {emergingText}
                            <div className="spinner-roller spinner-roller-reverse"/>
                        </div>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    },
                    {
                        label: lang.change_filament.stop,
                        dataAttrs: {
                            'ga-event': 'stop-emerging'
                        },
                        onClick: this._onStop
                    }]
                };
            },

            _sectionUnloading: function() {
                // TODO: unloading start
                var self = this;
                setTimeout(function() {
                    self._next(steps.COMPLETED);
                }, 3000);

                return {
                    message: (
                        <div className="message-container">
                            <p>{lang.change_filament.unloading}</p>
                            <div className="spinner-roller spinner-roller-reverse"/>
                        </div>
                    ),
                    buttons: [{
                        label: lang.change_filament.cancel,
                        dataAttrs: {
                            'ga-event': 'cancel'
                        },
                        onClick: this.props.onClose
                    },
                    {
                        label: lang.change_filament.stop,
                        dataAttrs: {
                            'ga-event': 'stop-unload'
                        },
                        onClick: this._onStop
                    }]
                };
            },

            _sectionCompleted: function() {
                return {
                    message: (
                        types.load === this.state.type ?
                        lang.change_filament.loaded :
                        lang.change_filament.unloaded
                    ),
                    buttons: [{
                        label: lang.change_filament.ok,
                        className: 'btn-default btn-alone-right',
                        dataAttrs: {
                            'ga-event': 'completed'
                        },
                        onClick: this.props.onClose
                    }]
                };
            },

            _sectionFactory: function() {
                var self = this,
                    renderFunc,
                    renderName = this.state.currentStep.toLowerCase().split('');

                renderName[0] = renderName[0].toUpperCase();
                renderName = '_section' + renderName.join('').replace('_', '');

                if (true === self.hasOwnProperty(renderName)) {
                    renderFunc = self[renderName];
                }
                else {
                    renderFunc = function() {
                        return {
                            buttons: [{
                                label: lang.change_filament.cancel,
                                className: 'btn-default btn-alone-left',
                                dataAttrs: {
                                    'ga-event': 'cancel'
                                },
                                onClick: self.props.onClose
                            }]
                        };
                    }
                }

                return renderFunc();
            },

            render: function() {
                if(false === this.props.open) {
                    return (<div/>);
                }

                var section = this._sectionFactory(),
                    content = (
                        <Alert
                            lang={lang}
                            caption={this._makeCaption(section.caption)}
                            message={section.message}
                            buttons={section.buttons}
                        />
                    ),
                    className = {
                        'modal-change-filament': true
                    };

                return (
                    <div className="always-top" ref="modal">
                        <Modal className={className} content={content} disabledEscapeOnBackground={false}/>
                    </div>
                );
            }

        });

    return View;
});
