
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactPropTypes',
    'helpers/i18n',
    'jsx!app/actions/beambox/Image-Trace-Panel-Controller',
    'app/actions/beambox',
    'app/actions/beambox/preview-mode-background-drawer',
    'app/actions/beambox/preview-mode-controller',
    'app/stores/beambox-store',
    'plugins/classnames/index',
    'helpers/api/image-tracer',
], function(
    $,
    React,
    PropTypes,
    i18n,
    ImageTracePanelController,
    BeamboxActions,
    PreviewModeBackgroundDrawer,
    PreviewModeController,
    BeamboxStore,
    classNames,
    ImageTracerApi
) {
    const LANG = i18n.lang.beambox.left_panel;

    class ImageTraceButton extends React.Component {
        constructor(props) {
            super(props);
        }

        _handleClick() {
            this.props.onClick();
            BeamboxActions.showCropper();
        }

        _renderButton() {
            return (
                <div
                    className='option preview-btn'
                    onClick={() => this._handleClick()}
                >
                    {LANG.image_trace}
                </div>
            );
        }

        render() {
            const active = this.props.active && !(PreviewModeBackgroundDrawer.isClean());
            return (
                <div
                    id='image-trace-button'
                    className={classNames({'active': active}, {'hide': !this.props.show})}
                    onClick={() => this._handleClick()}
                >
                    <div className={'text'}>{LANG.image_trace}</div>
                </div>
            );
        }
    };
    return ImageTraceButton;
});
