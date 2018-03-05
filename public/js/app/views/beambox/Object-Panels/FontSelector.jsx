define([
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!widgets/Select',
    'helpers/i18n',
    'app/actions/beambox/constant',
], function(React, PropTypes, FnWrapper, Selector, i18n, Constant) {

    const LANG = i18n.lang.beambox.object_panels;

    if (window.electron) {
        const ipc = electron.ipc;
        const events = electron.events;
        const fonts = ipc.sendSync(events.LIST_AVAILABLE_FONTS);
        console.log('fonts: ', fonts);
    }

    class FontSelector extends React.component {
        constructor() {
            this._handleFontChange = this._handleFontChange.bind(this);
            this._renderSelector = this._renderSelector.bind(this);
        }

        _handleFontChange(e) {
            console.log(e.target.value);
        }

        _renderSelector() {
            const options = [];

            return (
                <Selector
                    className=''
                    options={options}
                    onChange={this._handleFontChange}
                />
            );
        }

        render() {
            const FontSelectorInput = this._renderSelector();
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            字體
                            <span className="value">微軟正黑體</span>
                        </p>
                        <label className="accordion-body">
                            <div>
                                <div className="control">
                                    <span className="text-center header">字體</span>
                                    <FontSelectorInput/>
                                </div>
                            </div>
                        </label>
                    </label>
                </div>
            );
        }
    }

    return FontSelector;
});
