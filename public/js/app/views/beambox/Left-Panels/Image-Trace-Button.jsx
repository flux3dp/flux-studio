
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
    ImageTracerApi
) {
    const LANG = i18n.lang.beambox.left_panel;

    class ImageTraceButton extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                isWorking: false,
            };
        }

        _handleClick() {
            if (!PreviewModeBackgroundDrawer.isClean()) {
                this.props.onClick();
                this.setState({ isWorking: true });
                BeamboxActions.showCropper();
            }
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
            const button = this._renderButton();

            return (
                <div>
                    {button}
                </div>
            );
        }
    };
    return ImageTraceButton;
});
