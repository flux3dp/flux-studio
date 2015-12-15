define([
    'react'
], function(
    React
) {

    var guideStyle = {};

    return React.createClass({

        propTypes: {
            guides: React.PropTypes.array,
            enable: React.PropTypes.bool,
            step: React.PropTypes.number,
            onNextClick: React.PropTypes.func,
            onComplete: React.PropTypes.func
        },

        getInitialState: function() {
            return {
                currentStep: this.props.step || 0
            };
        },

        _handletourNavigation: function(e) {
            e.preventDefault();
            this.props.onNextClick();
            if(this.props.step === this.props.guides.length - 1) {
                this.props.onComplete();
            }
        },

        render: function() {
            if(!this.props.enable) {
                return (<div></div>);
            }

            var _o = $(this.props.guides[this.props.step].selector);

            if(_o.length !== 0) {
                guideStyle = {
                    position: 'relative',
                    left: _o.offset().left - 30,
                    top: _o.offset().top - 30,
                    width: _o.width() + 60,
                    height: _o.height() + 60,
                    border: 'solid 3px white'
                };
            }

            return (
                <div className="tour-mask" onClick={this._handletourNavigation}>
                    <div style={guideStyle}>
                        <div
                            className="tour-description"
                            onClick={this._handletourNavigation}>
                                {this.props.guides[this.props.step].text}
                        </div>
                    </div>
                </div>
            );
        }

    });

});
