
define([
    'react'
], function(
    React
) {
    class ToolboxItem extends React.Component {
        constructor() {
            super();
        }

        render() {
            return (
                <div onClick={this.props.onClick} className="toolbox-item" title={this.props.title}>
                    <img src={this.props.src} />
                </div>
            );
        }
    }
    return ToolboxItem;
});
