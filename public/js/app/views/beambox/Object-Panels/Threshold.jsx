define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/image-data',
    'helpers/i18n',
], function($, React, FnWrapper, ImageData, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            shading: React.PropTypes.bool.isRequired,
            threshold: React.PropTypes.number.isRequired,
            $me: React.PropTypes.object.isRequired
        },
        
        getInitialState: function() {
            return {
                shading: this.props.shading,
                threshold: this.props.threshold
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                shading: nextProps.shading,
                threshold: nextProps.threshold
            });
        },

        _writeShading: function(val) {
            FnWrapper.write_image_data_shading(this.props.$me, val);
        },
        _writeThreshold: function(val) {
            FnWrapper.write_image_data_threshold(this.props.$me, val);
        },
        _refreshImage: function() {
            const $me = this.props.$me;
            ImageData(
                $me.attr("origImage"),
                {
                    height: $me.height(),
                    width: $me.width(),
                    grayscale: {
                        is_rgba: true,
                        is_shading: Boolean(this.state.shading),
                        threshold: parseInt(this.state.threshold*255/100),
                        is_svg: false
                    },
                    onComplete: function(result) {
                        $me.attr('xlink:href', result.canvas.toDataURL('image/png'));
                    }
                }
            );
        },

        _handleShadingClick: function(event) {
            const currentShading = this.state.shading;
            const newShading = !currentShading;
            this.setState({shading: newShading}, function(){
                this._writeShading(newShading);
                this._refreshImage();
            });
        },
        _handleThresholdChange: function(event) {
            const val = event.target.value;
            this.setState({threshold: val}, function(){
                this._writeThreshold(val);
                this._refreshImage();
            });        
        },
        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                    <input type="checkbox" className="accordion-switcher"/>
                    <p className="caption">
                        {LANG.laser_config}
                        <span className="value">{LANG.shading} {this.state.shading ? 'On' : 'Off'} , {this.state.threshold}%</span>
                    </p>
                    <label className="accordion-body">
                        <div className="control">
                            <span className="text-center header">{LANG.shading}</span>
                            <label className='shading-checkbox' onClick={this._handleShadingClick}>
                                <i className={this.state.shading ? "fa fa-toggle-on" : "fa fa-toggle-off"}></i>
                            </label>
                        </div>
                        <div className="control">
                            <span className="text-center header">{LANG.threshold}</span>
                            <input type="range" min={0} max={100} value={this.state.threshold} onChange={this._handleThresholdChange} />
                        </div>
                    </label>
                </label>
            </div>
            );
        }
        
    });

});