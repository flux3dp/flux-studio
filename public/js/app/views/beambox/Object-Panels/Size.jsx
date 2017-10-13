define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
], function($, React, FnWrapper, UnitInput, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;

    const update_width_funcs = {
        rect:   FnWrapper.update_rect_width,
        image:  FnWrapper.update_image_width,
        use:    function(){console.log('TODO: _update_width_handler')},
    }
    const update_height_funcs = {
        rect:   FnWrapper.update_rect_height,
        image:  FnWrapper.update_image_height,
        use:    function(){console.log('TODO: _update_height_handler')},
    }
    let _update_width = ()=>{};
    let _update_height = ()=>{};
    
    return React.createClass({
        propTypes: {
            width: React.PropTypes.number.isRequired,
            height: React.PropTypes.number.isRequired,
            type: React.PropTypes.oneOf(['rect', 'image', 'use']).isRequired,
        },

        getInitialState: function() {
            return {
                width: this.props.width,
                height: this.props.height,
                isRatioPreserve: true
            };
        },

        componentWillMount: function() {
            _update_width = update_width_funcs[this.props.type];
            _update_height = update_height_funcs[this.props.type];
        },
        
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                width: nextProps.width,
                height: nextProps.height
            });
        },

        _update_width_handler: function(val) {
            if(this.state.isRatioPreserve) {
                const height = val * (this.state.height/this.state.width);
                _update_height(height);
                this.setState({height: height});
            }
            _update_width(val);
            this.setState({width: val});
        },
        _update_height_handler: function(val) {
            if(this.state.isRatioPreserve) {
                const width = val * (this.state.width/this.state.height);
                _update_width(width);
                this.setState({width: width});
            }
            _update_height(val);
            this.setState({height: val});            
        },
        _ratio_handler: function(e) {
            this.setState({
                isRatioPreserve: e.target.checked
            });
        },
        render: function() {
            const disableInput = (this.props.type === 'use');
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        {LANG.size}
                        <span className="value">{this.state.width} x {this.state.height} mm</span>
                    </p>
                    
                    
                    <label className="accordion-body with-lock">
                        <div>
                            <div className="control">
                                <span className="text-center header">{LANG.width}</span>
                                <UnitInput
                                    min={0}
                                    max={4000}
                                    unit="mm"
                                    defaultValue={this.state.width}
                                    getValue={this._update_width_handler}
                                    disabled={disableInput}
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
                                    disabled={disableInput}
                                />
                            </div>
                        </div>

                        <div className='lock'>
                            <input type="checkbox" checked={this.state.isRatioPreserve} id="togglePreserveRatio" onChange={this._ratio_handler} hidden/>
                            <label htmlFor="togglePreserveRatio"><i className={this.state.isRatioPreserve?"fa fa-lock":"fa fa-unlock-alt"}></i></label>
                        </div>

                    </label>
                </label>
            </div>
            );
        }
        
    });

});