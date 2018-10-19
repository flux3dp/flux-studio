define([
    'react',
    'reactDOM',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/stores/beambox-store',
    'jsx!views/beambox/Left-Panels/Insert-Object-Submenu',
    'jsx!views/beambox/Left-Panels/Preview-Button',
    'jsx!views/beambox/Left-Panels/Advanced-Panel',
    'helpers/api/inter-process',
    'helpers/i18n'
], function(
    React,
    ReactDOM,
    FnWrapper,
    BeamboxStore,
    InsertObjectSubmenu,
    PreviewButton,
    AdvancedPanel,
    InterProcessApi,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel;
    const interProcessWebSocket = InterProcessApi() ;

    class LeftPanel extends React.Component {
        constructor() {
            super();
            this.state = {
                isInsertObjectMenuOpen: false,
                isAdvancedPanelOpen: false
                // preview button is managed by itself
            };
        }

        componentDidMount() {
            $('#svgcanvas').mouseup(() => {
                this._toogleInsert(false);
            });

            BeamboxStore.onCloseInsertObjectSubmenu(() => this.closeInsertObjectSubmenu());
        }

        componentWillUnmount() {
            BeamboxStore.removeCloseInsertObjectSubmenuListener(() => this.closeInsertObjectSubmenu());
        }

        closeInsertObjectSubmenu() {
            this._toogleInsert(false);
        }

        _toogleAdvanced(isOpen) {
            this.setState({
                isAdvancedPanelOpen: isOpen === undefined ? !this.state.isAdvancedPanelOpen : isOpen
            });

            if (isOpen) {
                FnWrapper.clearSelection();
                this._toogleInsert(false)
            }
        }

        _toogleInsert(isOpen) {
            this.setState({
                isInsertObjectMenuOpen: isOpen === undefined ? !this.state.isInsertObjectMenuOpen : isOpen
            });

            if (isOpen) {
                FnWrapper.clearSelection();
            }
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

        _renderAdvanced() {
            const advancedPanel = <AdvancedPanel onClose={() => this._toogleAdvanced(false)}/>;

            return (
                <div>
                    <div className='option' onClick={() => this._toogleAdvanced(true)} style={{display: 'inline-block', width: 'unset'}}>
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
                    <PreviewButton />
                    {this._renderAdvanced()}
                </div>
            );
        }
    }

    return LeftPanel;
});
