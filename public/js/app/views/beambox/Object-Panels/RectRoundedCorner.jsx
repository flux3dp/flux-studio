define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
    'app/actions/beambox/constant',
], function($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {

    const LANG = i18n.lang.beambox.object_panels;

    return React.createClass({
        propTypes: {
            rx: PropTypes.number.isRequired
        },

        getInitialState: function() {
            return {
                rx: this.props.rx
            };
        },

        componentWillReceiveProps: function(nextProps) {
            this.setState({
                rx: nextProps.rx
            });
        },

        _update_rx_handler: function(val) {
            FnWrapper.update_ellipse_rx(val);
            this.setState({rx: val});
        },

        getValueCaption: function() {
            const rx = this.state.rx,
                units = localStorage.getItem('default-units', 'mm') ;
            if (units === 'inches') {
                return `${Number(rx/25.4).toFixed(3)}\"`;
            } else {
                return `${rx} mm`;
            }
        },

        render: function() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={false} />
                        <p className="caption">
                            {LANG.rounded_corner}
                            <span className="value">{this.getValueCaption()}</span>
                        </p>
                        <label className="accordion-body  with-lock">
                            <div>
                                <div className="control">
                                    <span className="text-center header">{LANG.radius}</span>
                                    <UnitInput
                                        min={0}
                                        max={Constant.dimension.width/Constant.dpmm}
                                        unit="mm"
                                        defaultValue={this.state.rx}
                                        getValue={this._update_rx_handler}
                                    />
                                </div>
                            </div>
                        </label>
                    </label>
                </div>
            );
        }
    });
});
