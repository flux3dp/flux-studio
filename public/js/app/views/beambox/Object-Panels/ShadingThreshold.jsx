define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/image-data',
    'helpers/i18n'
], function($, React, PropTypes, FnWrapper, ImageData, i18n) {
    'use strict';

    const LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            shading: PropTypes.bool.isRequired,
            threshold: PropTypes.number.isRequired,
            $me: PropTypes.object.isRequired
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
                        threshold: parseInt(this.state.threshold),
                        is_svg: false
                    },
                    onComplete: function(result) {
                        $me.attr('xlink:href', result.canvas.toDataURL('image/png'));
                    }
                }
            );
        },

        handleShadingClick: function(event) {
            const { shading } = this.state;
            const threshold = (shading ? 128 : 255);

            this.setState({
                shading: !shading,
                threshold: threshold
            }, () => {
                this._writeShading(!shading);
                this._writeThreshold(threshold);
                this._refreshImage();
            });
        },

        handleThresholdChange: function(event) {
            const val = event.target.value;

            this.setState({threshold: val}, function(){
                this._writeThreshold(val);
                this._refreshImage();
            });
        },

        render: function() {
            const { shading, threshold } = this.state;

            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher"/>
                        <p className="caption">
                            {LANG.laser_config}
                            <span className="value">{shading ? LANG.shading + ', ' : ''}{threshold}</span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">{LANG.shading}</span>
                                <label className='shading-checkbox' onClick={(e) => this.handleShadingClick(e)}>
                                    <i className={shading ? "fa fa-toggle-on" : "fa fa-toggle-off"}></i>
                                </label>
                            </div>
                            <div className="control">
                                <span className="text-center header">{LANG.threshold}</span>
                                <input type="range" min={0} max={255} value={threshold} onChange={(e) => this.handleThresholdChange(e)} />
                            </div>
                        </label>
                    </label>
                </div>
            );
        }

    });

});
