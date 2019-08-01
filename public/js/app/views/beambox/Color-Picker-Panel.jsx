
/* eslint-disable react/no-multi-comp */
define([
    'jquery',
    'react',
    'reactDOM',
    'helpers/i18n',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'jsx!widgets/Modal',
], function(
    $,
    React,
    ReactDOM,
    i18n,
    ProgressActions,
    ProgressConstants,
    Modal
) {
    const LANG = i18n.lang.beambox.photo_edit_panel;
    
    class ColorPickerPanel extends React.Component{
        constructor(props) {
            super(props);
            this.reactRoot = '';
            this.me = null;
            this.layer = null;
            this.unmount = this.unmount.bind(this);
            this.width = 200;
        }

        init(reactRoot, layer, $me) {
            this.reactRoot = reactRoot;
            this.layer = layer;
            this.$me = $me;
        }

        render() {
            if(this.layer) {
                this._render();
            } else {
                this.unmount();
            }
        }

        renderPickr() {
            const Pickr = require('@simonwep/pickr');
            console.log($(this.layer).attr('data-color'));
            const origColor = $(this.layer).attr('data-color');
            this.pickr = Pickr.create({
                el: '.pickr',
                theme: 'monolith', // or 'monolith', or 'nano'
                inline: true,
                default: origColor,
                swatches: [
                ],
                components: {
                    // Main components
                    preview: true,
                    opacity: false,
                    hue: true,
                    // Input / output Options
                    interaction: {
                        input: false,
                        cancel: false,
                        save: false
                    }
                }
            });
        }

        setPosition(left, top) {
            left -= this.width;
            this.style =  {
                top,
                left
            }
        }

        onApply() {
            const hexColor = this.pickr.getColor().toHEXA().toString()
            $(this.layer).attr('data-color', hexColor);
            this.$me.find('div').css('background', hexColor);
            this.unmount();
        }

        onBlur() {
            console.log('hi');
        }

        unmount() {
            this.element = null;
            ReactDOM.unmountComponentAtNode(document.getElementById(this.reactRoot));
        }

        _renderfooter() {
            return (
                <div className='footer'>
                    {this._renderFooterButton(LANG.okay, this.onApply.bind(this))}
                    {this._renderFooterButton(LANG.cancel, this.unmount.bind(this))}
                </div>
            );
        }

        _renderFooterButton(label, onClick) {
            return(
                <button
                        className={`btn btn-default pull-right`}
                        onClick={() => {onClick()}}
                    >
                        {label}
                </button>
            )
        }

        _render() {
            const footer = this._renderfooter();
            ReactDOM.render(
                    <div className='color-picker-panel' style={this.style}>
                        <div className='modal-background' onClick={this.unmount}></div>
                        <div className='pickr'></div>
                        {footer}
                    </div>, document.getElementById(this.reactRoot)
            );
        }
    }

    const instance = new ColorPickerPanel();

    return instance;
});
