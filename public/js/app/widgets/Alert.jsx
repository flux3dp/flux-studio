define(['react', 'jsx!widgets/Button-Group'], function(React, ButtonGroup) {
    'use strict';

    return React.createClass({

        getDefaultProps: function () {
            return {
                lang: {},
                caption: '',
                message: '',
                buttons: []
            };
        },

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
                    <pre className="message">{this.props.message}</pre>
                    {buttonsGroup}
                </div>
            );
        }
    });
});
