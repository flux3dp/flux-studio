define([
    'jquery',
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Unit-Input-v2',
    'helpers/i18n',
    'app/actions/beambox/constant'
], function($, React, PropTypes, FnWrapper, UnitInput, i18n, Constant) {

    const LANG = i18n.lang.beambox.object_panels;

    class SizePanel extends React.Component{

        constructor(props) {
            super(props);

            this.state = {
                width: props.width,
                height: props.height,
                isRatioPreserve: (props.type !== 'rect')
            };

            this.propTypes = {
                width: PropTypes.number.isRequired,
                height: PropTypes.number.isRequired,
                type: PropTypes.oneOf(['rect', 'image', 'use']).isRequired
            };
        }

        componentWillReceiveProps(nextProps) {
            this.setState({
                width: nextProps.width,
                height: nextProps.height
            });
        }

        _updateWidth(val) {
            switch(this.props.type) {
                case 'rect':
                    FnWrapper.update_rect_width(val);
                    break;
                case 'image':
                    FnWrapper.update_image_width(val);
                    break;
                case 'use':
                    svgCanvas.setSvgElemSize('width', val * Constant.dpmm);
                    break;
            }

            this.setState({ width: val });
        }

        _updateHeight(val) {
            switch(this.props.type) {
                case 'rect':
                    FnWrapper.update_rect_height(val);
                    break;
                case 'image':
                    FnWrapper.update_image_height(val);
                    break;
                case 'use':
                    svgCanvas.setSvgElemSize('height', val * Constant.dpmm);
                    break;
            }

            this.setState({ height: val });
        }

        handleUpdateWidth(val) {
            const {
                width,
                height,
                isRatioPreserve
            } = this.state;

            if (isRatioPreserve) {
                const constraintHeight = Number((val * height / width).toFixed(2));

                this._updateHeight(constraintHeight);
            }

            this._updateWidth(val);
        }

        handleUpdateHeight(val) {
            const {
                width,
                height,
                isRatioPreserve
            } = this.state;

            if (isRatioPreserve) {
                const constraintWidth = Number((val * width / height).toFixed(2));

                this._updateWidth(constraintWidth);
            }

            this._updateHeight(val);
        }

        handleRatio(e) {
            this.setState({ isRatioPreserve: e.target.checked });
        }

        getValueCaption() {
            const width = this.state.width, 
                height = this.state.height,
                units = localStorage.getItem('default-units', 'mm') ;
            if (units === 'inches') {
                return `${Number(width/25.4).toFixed(3)}\" x ${Number(height/25.4).toFixed(3)}\"`;
            } else {
                return `${width} x ${height} mm`;
            }
        }

        render() {
            const {
                width,
                height,
                isRatioPreserve
            } = this.state;

            return (
                <div className='object-panel'>
                    <label className='controls accordion'>
                        <input type='checkbox' className='accordion-switcher' defaultChecked={true}/>
                        <p className='caption'>
                            {LANG.size}
                            <span className='value'>{this.getValueCaption()}</span>
                        </p>

                        <label className='accordion-body with-lock'>
                            <div>
                                <div className='control'>
                                    <span className='text-center header'>{LANG.width}</span>
                                    <UnitInput
                                        min={0}
                                        unit='mm'
                                        defaultValue={width}
                                        getValue={(val) => this.handleUpdateWidth(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <span className='text-center header'>{LANG.height}</span>
                                    <UnitInput
                                        min={0}
                                        unit='mm'
                                        defaultValue={height}
                                        getValue={(val) => this.handleUpdateHeight(val)}
                                    />
                                </div>
                            </div>

                            <div className='lock'>
                                <input type='checkbox' checked={isRatioPreserve} id='togglePreserveRatio' onChange={(e) => this.handleRatio(e)} hidden/>
                                <label htmlFor='togglePreserveRatio' title={LANG.lock_desc}><div>┐</div><i className={isRatioPreserve?'fa fa-lock locked':'fa fa-unlock-alt unlocked'} /><div>┘</div></label>
                            </div>

                        </label>
                    </label>
                </div>
            );
        }
    };

    return SizePanel;
});
