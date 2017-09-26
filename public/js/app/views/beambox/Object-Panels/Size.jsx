define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, FnWrapper, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;
    
    return React.createClass({
        propTypes: {
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired,
            type: React.PropTypes.oneOf(['rect', 'image', 'use']).isRequired,
        },

        getInitialState: function() {
            return {
                width: this.props.width,
                height: this.props.height
            };
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                width: nextProps.width,
                height: nextProps.height
            });
        },

        _update_width_handler: function(val) {
            const fn={
                rect:   FnWrapper.update_rect_width,
                image:  FnWrapper.update_image_width,
                use:    function(){console.log('TODO: _update_width_handler')},
            }
            fn[this.props.type](val);
            this.setState({width: val});
        },
        _update_height_handler: function(val) {
            const fn={
                rect:   FnWrapper.update_rect_height,
                image:  FnWrapper.update_image_height,
                use:    function(){console.log('TODO: _update_height_handler')},
            }
            fn[this.props.type](val);
            this.setState({height: val});            
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        {LANG.size}
                        <span className="value">{this.state.width} x {this.state.height}mm</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">{LANG.width}</span>
                            <UnitInput
                                min={0}
                                max={4000}
                                unit="mm"
                                defaultValue={this.state.width}
                                getValue={this._update_width_handler}
                            />
                        </div>
                        <div className="control">
                            <span className="text-center header">{LANG.height}</span>
                            <UnitInput
                                min={0}
                                max={4000}
                                unit="mm"
                                defaultValue={this.state.height}
                                getValue={this._update_height_handler}
                            />
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});