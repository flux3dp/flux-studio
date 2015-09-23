define([
    'jquery',
    'react',
    'app/actions/print'
], function($, React, printController) {
    'use strict';

    return React.createClass({
        getInitialState: function() {
            return {
                raftOn      : true,
                supportOn   : true
            }
        },
        _handleToggleRaft: function(e) {
            this.setState({
                raftOn: !this.state.raftOn
            });
            this.props.onRaftClick(!this.state.raftOn);
        },
        _handleToggleSupport: function(e) {
            this.setState({
                supportOn: !this.state.supportOn
            });
            this.props.onSupportClick(!this.state.supportOn);
        },
        render: function() {
            var lang = this.props.lang.print.left_panel;
            return (
                <div className='leftPanel'>
                    <ul>
                        <li>HIGH QUALITY</li>
                        <li>WHITE PLA</li>
                        <li onClick={this._handleToggleRaft}>{this.state.raftOn ? lang.raft_on : lang.raft_off}</li>
                        <li onClick={this._handleToggleSupport}>{this.state.supportOn ? lang.support_on : lang.support_off}</li>
                        <li onClick={this.props.onShowAdvancedSettingPanel}>{lang.advanced}</li>
                    </ul>
                </div>
            );
        }
    });
});
