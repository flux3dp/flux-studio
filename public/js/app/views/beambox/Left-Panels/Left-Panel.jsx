define([
    'react',
    'reactDOM',
    'jsx!widgets/Dialog-Menu',
    'jsx!views/beambox/Left-Panels/Insert-Object-Submenu',
    'jsx!views/beambox/Left-Panels/Preview-Button',
    'jsx!views/beambox/Left-Panels/Advanced-Panel',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
], function(
    React,
    ReactDOM,
    DialogMenu,
    InsertObjectSubmenu,
    PreviewButton,
    AdvancedPanel,
    FnWrapper,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel;

    class LeftPanel extends React.PureComponent {
        _handleAdvancedClick() {
            const advancePanelRoot = document.getElementById('advanced-panel-placeholder');
            ReactDOM.render(<AdvancedPanel
                onClose={() => ReactDOM.unmountComponentAtNode(advancePanelRoot)}
            />, advancePanelRoot);
        }

        _renderInsertObject() {
            // 歷史的遺骸
            const item = {
                label: (
                    <div>
                        <span>{LANG.insert_object}</span>
                    </div>
                ),
                content: (
                    <InsertObjectSubmenu />
                ),
                disable: false
            };
            return <DialogMenu ref="dialogMenu" items={[item]}/>;
        }

        _renderPreview() {
            return (
                <PreviewButton />
            );
        }

        _renderAdvanced() {
            return (
                <div>
                    <div
                        className='option'
                        onClick={() => this._handleAdvancedClick()}
                    >
                        {LANG.advanced}
                    </div>
                    <span id='advanced-panel-placeholder'/>
                </div>
            );
        }

        render() {
            return (
                <div className="left-panel">
                    {this._renderInsertObject()}
                    {this._renderPreview()}
                    {this._renderAdvanced()}
                </div>
            );
        }
    }
    return LeftPanel;
});
