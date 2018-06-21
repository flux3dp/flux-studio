define([
    'react',
    'reactDOM',
    'jsx!views/beambox/Left-Panels/Insert-Object-Submenu',
    'jsx!views/beambox/Film-Cutter/Download-Films',
    'jsx!views/beambox/Left-Panels/Advanced-Panel',
    'helpers/i18n',
], function(
    React,
    ReactDOM,
    InsertObjectSubmenu,
    DownloadFilms,
    AdvancedPanel,
    i18n
) {
    const LANG = i18n.lang.beambox.left_panel;

    class LeftPanel extends React.Component {
        constructor() {
            super();
            this.state = {
                isInsertObjectMenuOpen: false,
                isAdvancedPanelOpen: false,
                isDownloadFilmsOpen: false
                // preview button is managed by itself
            };
        }
        componentDidMount() {
            $('#svgcanvas').mouseup(() => {
                this._toggleInsert(false);
            });
        }
        _toggleAdvanced(isOpen) {
            this.setState({
                isAdvancedPanelOpen: isOpen === undefined ? !this.state.isAdvancedPanelOpen : isOpen
            });
        }
        _toggleInsert(isOpen) {
            this.setState({
                isInsertObjectMenuOpen: isOpen === undefined ? !this.state.isInsertObjectMenuOpen : isOpen
            });
        }
        _toggleDownloadFilms(isOpen) {
            this.setState({
                isDownloadFilmsOpen: isOpen === undefined ? !this.state.isDownloadFilmsOpen : isOpen
            });
        }

        _renderDownloadFilms() {
            const downloadFilmsPanel = <DownloadFilms onClose={() => this._toggleDownloadFilms(false)}/>;
            return (
                <div>
                    <div className='option' onClick={() => this._toggleDownloadFilms()}>
                        {'選擇手機膜'}
                    </div>
                    {this.state.isDownloadFilmsOpen ? downloadFilmsPanel : ''}
                </div>
            );
        }

        _renderInsertObject() {
            const insertObjectPanel = <InsertObjectSubmenu onClose={() => this._toggleInsert(false)}/>;
            return (
                <div className='ui ui-dialog-menu'>
                    <div className='ui-dialog-menu-item'>
                        <div className='dialog-label' onClick={() => this._toggleInsert()}>
                            {LANG.insert_object}
                        </div>
                        {this.state.isInsertObjectMenuOpen ? insertObjectPanel : ''}
                    </div>
                </div>
            );
        }

        _renderAdvanced() {
            const advancedPanel = <AdvancedPanel onClose={() => this._toggleAdvanced(false)}/>;
            return (
                <div>
                    <div className='option' onClick={() => this._toggleAdvanced()} style={{display: 'inline-block', width: 'unset'}}>
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
                    {this._renderDownloadFilms()}
                    {this._renderAdvanced()}
                </div>
            );
        }
    }
    return LeftPanel;
});
