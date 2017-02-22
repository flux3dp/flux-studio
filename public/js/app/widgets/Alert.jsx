define(['react', 'jsx!widgets/Button-Group', 'helpers/i18n'], function(React, ButtonGroup, i18n) {
    'use strict';
    var lang = i18n.lang.buttons;

    return React.createClass({

        getDefaultProps: function () {
            return {
                lang: {},
                caption: '',
                message: '',
                buttons: [],
                images: [],
                imgClass: '',
                displayImages: false,
                onClose: function() {}
            };
        },

        getInitialState: function () {
            return {
                imgIndex: 0
            };
        },

        _renderMessage: function() {
            if (this.props.displayImages) {
                return <img className={this.props.imgClass} src={this.props.images[this.state.imgIndex]}></img>
            } else {
                return typeof this.props.message === 'string' ?
                            <pre className="message" dangerouslySetInnerHTML={{__html: this.props.message}}></pre> :
                            <pre className="message">{this.props.message}</pre>
            }
        },

        _renderButtons: function() {
            var self = this;
            if (this.props.displayImages) {
                if (this.state.imgIndex < this.props.images.length - 1) {
                    return <ButtonGroup buttons={[{
                        label: lang.next,
                        right: true,
                        onClick: () => {
                            self.setState({imgIndex: this.state.imgIndex + 1});
                        }
                    }]}/>
                } else {
                    return <ButtonGroup buttons={[{
                        label: lang.next,
                        right: true,
                        onClick: () => {
                            self.setState({imgIndex: 0});
                            self.props.onClose();
                        }
                    }]}/>
                }
            } else {
                return <ButtonGroup buttons={this.props.buttons}/>
            }
        },

        render: function() {
            var caption = (
                    '' !== this.props.caption ?
                    <h2 className="caption">{this.props.caption}</h2> :
                    ''
                ),
                html = this._renderMessage(),
                buttons = this._renderButtons(),
                className = 'modal-alert';

                if (this.props.displayImages) {
                    className += " " + this.props.imgClass;
                }

            return (
                <div className={className}>
                    {caption}
                    {html}
                    {buttons}
                </div>
            );
        }
    });
});
