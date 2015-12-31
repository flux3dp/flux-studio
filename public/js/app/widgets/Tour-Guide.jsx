define([
    'react',
    'app/actions/alert-actions',
    'helpers/device-master',
], function(
    React,
    AlertActions,
    DeviceMaster
) {

    var lang;

    return React.createClass({

        propTypes: {
            lang: React.PropTypes.object,
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

        componentWillMount: function() {
            lang = this.props.lang;
        },

        _handletourNavigation: function(e) {
            e.preventDefault();
            this.props.onNextClick();
            if(this.props.step === this.props.guides.length - 1) {
                this.props.onComplete();
            }
        },

        _renderTourMask: function(hole, text, r, position) {
            var content = (
                `<svg class="tour" style="width: 100%; height: 100%; position: absolute; z-index: 99999; left:0;">
                    <rect width="100%" mask="url(#hole)" height="100%" fill="rgba(0,0,0,0.3)"></rect>
                    <text x="${text.x}" y="${text.y}" text-anchor="${position}" fill="white" class="tour-text">${text.content}</text>
                    <defs>
                        <mask id="hole">
                            <rect width="100%" height="100%" fill="white"></rect>
                            <circle r="${r}" cx="${hole.x}" cy="${hole.y}"></circle>
                        </mask>
                    </defs>
                </svg>`
            );
            return {
                __html: content
            };
        },

        render: function() {
            if(!this.props.enable) {
                return (<div></div>);
            }

            var _o = $(this.props.guides[this.props.step].selector),
                _guide = this.props.guides[this.props.step],
                _r = _guide.r,
                _text = {},
                _hole = {},
                _position,
                content = '';

            _text.content = _guide.text;

            var positions = {
                'top': function() {
                    _hole.x = _o.offset().left + _o.width() / 2;
                    _hole.y = _o.offset().top + _o.height() / 2;
                    _text.x = _hole.x;
                    _text.y = _hole.y - 100;
                    _position = 'middle';
                },
                'bottom': function() {
                    _hole.x = _o.offset().left + _o.width() / 2;
                    _hole.y = _o.offset().top + _o.height() / 2;
                    _text.x = _hole.x;
                    _text.y = _hole.y + _r + 50;
                    _position = 'middle';
                },
                'left': function() {
                    _hole.x = _o.offset().left + _o.width() / 2;
                    _hole.y = _o.offset().top + _o.height() / 2;
                    _text.x = _hole.x - _r / 2 - 50;
                    _text.y = _hole.y;
                    _position = 'end';
                },
                'right': function() {
                    _hole.x = _o.offset().left + _o.width() / 2;
                    _hole.y = _o.offset().top + _o.height() / 2;
                    _text.x = _hole.x + _r / 2 + 50;
                    _text.y = _hole.y;
                    _position = 'start';
                },
            };

            if(_o.length > 0) {
                positions[_guide.position]();
                content = (
                    <div
                        id="tourContent"
                        dangerouslySetInnerHTML={this._renderTourMask(_hole, _text, _r, _position)}></div>
                );
            }


            return (
                <div className="tour" onClick={this._handletourNavigation}>
                    <div>
                        <a className="btn btn-default btn-tutorial" onClick={this.props.onComplete}>{lang.tutorial.skip}</a>
                    </div>
                    {content}
                </div>
            );
        }

    });

});
