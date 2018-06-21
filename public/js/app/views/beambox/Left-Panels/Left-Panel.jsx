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

    class LeftPanel extends React.Component {
        constructor() {
            super();
            this.state = {
                isInsertObjectMenuOpen: false,
                isAdvancedPanelOpen: false
                // preview button is managed by itself
            };
        }
        _toogleAdvanced(isOpen) {
            this.setState({
                isAdvancedPanelOpen: isOpen === undefined ? !this.state.isAdvancedPanelOpen : isOpen
            });
        }
        _toogleInsert(isOpen) {
            this.setState({
                isInsertObjectMenuOpen: isOpen === undefined ? !this.state.isInsertObjectMenuOpen : isOpen
            });
        }

        _renderInsertObject() {
            const insertObjectPanel = <InsertObjectSubmenu onClose={() => this._toogleInsert(false)}/>;
            return (
                <div className='ui ui-dialog-menu'>
                    <div className='ui-dialog-menu-item'>
                        <div className='dialog-label' onClick={() => this._toogleInsert(true)}>
                            {LANG.insert_object}
                        </div>
                        {this.state.isInsertObjectMenuOpen ? insertObjectPanel : ''}
                    </div>
                </div>
            );
        }

        _renderPreview() {
            return (
                <PreviewButton />
            );
        }

        _renderAdvanced() {
            const advancedPanel = (
                <AdvancedPanel
                    onClose={() => this._toogleAdvanced(false)}
                />
            );
            return (
                <div>
                    <div
                        className='option'
                        onClick={() => this._toogleAdvanced(true)}
                    >
                        {LANG.advanced}
                    </div>
                    {this.state.isAdvancedPanelOpen ? advancedPanel : ''}
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
