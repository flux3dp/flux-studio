define([
    'jquery',
    'react',
], function($, React) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onToggleLock: React.PropTypes.func,
                onReset: React.PropTypes.func
            };
        },
        getInitialState: function() {
            return {
                locked: true
            };
        },
        _handleToggleLock: function (e) {
            this.props.onToggleLock(!this.state.locked);
            this.setState({ locked: !this.state.locked });
        },
        _handleReset: function(e) {
            this.props.onReset();
        },
        render: function() {
            var lang    = this.props.lang,
                lockClass = this.state.locked ? 'lock' : 'unlock';

            return (
                <div className="control-bottom">
                    <div className="panel">
                        <div className="container vertical-middle">
                            <div className="controls">
                                <label>X</label>
                                <input type="text" />
                            </div>
                            <div className="controls">
                                <label>Y</label>
                                <input type="text" />
                            </div>
                            <div className="controls">
                                <label>Z</label>
                                <input type="text" />
                            </div>
                            <div className="controls lock-container" onClick={this._handleToggleLock}>
                                <div className={lockClass}></div>
                            </div>
                            <div className="controls">
                                <label>{lang.print.scale}</label>
                                <input type="text" />
                            </div>
                            <div clasName="controls">
                                <a className="btn btn-default" onClick={this._handleReset}>{lang.print.reset}</a>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

    });
});