define([
    'react',
    'reactPropTypes',
    'app/constants/global-constants',
    'app/constants/device-constants',
], (
    React,
    PropTypes,
    GlobalConstants,
    DeviceConstants
) => {

    return React.createClass({
        PropTypes: {
            name:           PropTypes.string,
            source:         PropTypes.string,
            history:        PropTypes.array,
            onBackClick:    PropTypes.func,
            onFolderClick:  PropTypes.func,
            onCloseClick:   PropTypes.func
        },

        contextTypes: {
            store: PropTypes.object
        },

        componentWillMount: function() {
            let { store } = this.context;

            this.unsubscribe = store.subscribe(() => {
                this.forceUpdate();
            });
        },

        componentWillUpdate: function() {
            return false;
        },

        componentWillUnmount: function() {
            this.unsubscribe();
        },

        _renderNavigation: function() {
            let { Monitor, Device } = this.context.store.getState(),
                history = this.props.history,
                source = this.props.source;

            const back = () => (
                <div className="back" onClick={this.props.onBackClick}>
                    <i className="fa fa-angle-left"></i>
                </div>
            );

            const folder = () => (
                <div className="back" onClick={this.props.onFolderClick}>
                    <img src="img/folder.svg" />
                </div>
            );

            const none = () => (
                <div></div>
            );

            if(source === GlobalConstants.DEVICE_LIST) {
                let go = {};

                go[GlobalConstants.CAMERA] = () => {
                    return back();
                };

                go[GlobalConstants.FILE] = () => {
                    if(Device.status.st_id === DeviceConstants.status.IDLE) {
                        return history.length >= 1 ? back() : none();
                    }
                    return back();
                };

                if(typeof go[Monitor.mode] === 'function') {
                    return go[Monitor.mode]();
                }
                else {
                    return history.length > 1 ? back() : folder();
                }
            }
            else {
                return (Monitor.mode === GlobalConstants.PREVIEW && history.length === 0) ?
                    folder() : back();
            };
        },

        render: function() {
            let nav = this._renderNavigation();

            return (
                <div className="header">
                    <div className="title">
                        <span>{this.props.name}</span>
                        <div className="close" onClick={this.props.onCloseClick}>
                            <div className="x"></div>
                        </div>
                        {nav}
                    </div>
                </div>
            );
        }

    });
});
