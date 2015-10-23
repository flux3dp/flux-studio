define(['react', 'jsx!widgets/Button-Group'], function(React, ButtonGroup) {
    'use strict';

    return React.createClass({

        render: function() {
            var buttonsGroup = (
                    <ButtonGroup buttons={this.props.buttons}/>
                ),
                caption = (
                    '' !== this.props.caption ?
                    <h2 className="caption">{this.props.caption}</h2> :
                    ''
                );

            return (
                <div className="modal-alert">
                    {caption}
                    <p className="message">{this.props.message}</p>
                    {buttonsGroup}
                </div>
            );
        },

        getDefaultProps: function () {
            return {
                lang: {},
                caption: React.PropTypes.string,
                message: React.PropTypes.string,
                buttons: React.PropTypes.array
            };
        },
    });
});