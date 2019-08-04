define([
    'jquery',
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
], function($, React, FnWrapper, i18n) {

    const LANG = i18n.lang.beambox.object_panels;

    class FillPanel extends React.Component{

        constructor(props) {
            super(props);
            this.closed = true;
            const isFill = ((props.$me.attr('fill-opacity') === 1) && (props.$me.attr('fill') !== 'none'));
            this.state = {
                isFill: isFill
            };
            this._handleClick = this._handleClick.bind(this);
            if (props.type === 'path') {
                const d = props.$me.attr('d');
                const matchM = d.match(/M/ig);
                const matchZ = d.match(/z/ig);
                if (!matchZ || matchM.length != matchZ.length) {
                    this.closed = false;
                }
            }
        }

        _handleClick() {
            if (this.state.isFill) {
                svgCanvas.setSelectedUnfill();
            } else {
                svgCanvas.setSelectedFill();
            }
            this.setState({isFill: !this.state.isFill});
        }

        render() {
            return this.closed ? (
                <div className='object-panel'>
                    <label className='controls accordion' onClick={this._handleClick}>
                        <p className='caption'>
                            {LANG.fill}
                            <label className='shading-checkbox' onClick={this._handleClick}>
                                <i className={this.state.isFill ? 'fa fa-toggle-on' : 'fa fa-toggle-off'} />
                            </label>
                        </p>
                    </label>
                </div>
            ) : null;
        }
    };

    return FillPanel;
});
