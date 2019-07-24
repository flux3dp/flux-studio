define([
    'react',
    'reactDOM',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/global-actions',
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
    GlobalActions,
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
            this._setEndPreview = this._setEndPreview.bind(this);
        }

        componentDidMount() {
            // Selection Management
            $('#svgcanvas').mouseup(() => {
                this._toggleInsert(false);
                GlobalActions.monitorClosed();
            });

            $('#layerpanel').mouseup(() => {
                this._toggleInsert(false);
                this._toggleAdvanced(false);
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            });

            $('#layerpanel').mouseup(() => {
                this._toggleInsert(false);
                this._toggleAdvanced(false);
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            });

            $('#layer-laser-panel-placeholder').mouseup(() => {
                this._toggleInsert(false);
                this._toggleAdvanced(false);
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            });

            $('.selLayerBlock').mouseup(() => {
                GlobalActions.monitorClosed();
            });
_
            $('#tools_top').mouseup(() => {
                this._toggleAdvanced(false);
                this._toggleInsert(false);
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            });

            // Add class color to #svg_editor
            $('#svg_editor').addClass('color');

            BeamboxStore.onCloseInsertObjectSubmenu(() => this.closeInsertObjectSubmenu());
        }

        componentWillUnmount() {
            $('#svg_editor').removeClass('color');

            BeamboxStore.removeCloseInsertObjectSubmenuListener(() => this.closeInsertObjectSubmenu());
        }

        closeInsertObjectSubmenu() {
            this._toggleInsert(false);
        }

        _toggleAdvanced(isOpen) {
            if (this.state.isAdvancedPanelOpen === isOpen) {
                return;
            }

            this.setState({ isAdvancedPanelOpen: isOpen });

            if (isOpen) {
                this._toggleInsert(false);
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            }
        }

        _toggleInsert(isOpen) {
            if (this.state.isInsertObjectMenuOpen === isOpen) {
                return;
            }

            this.setState({ isInsertObjectMenuOpen: isOpen });

            if (isOpen) {
                FnWrapper.clearSelection();
                GlobalActions.monitorClosed();
            }
        }

        _renderInsertObject() {
            const insertObjectPanel = <InsertObjectSubmenu onClose={() => this._toggleInsert(false)}/>;

            return (
                <div className='ui ui-dialog-menu'>
                    <div className='ui-dialog-menu-item'>
                        <div className='dialog-label' style={{width: 'auto'}} onClick={() => this._toggleInsert(true)}>
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
                    <div className='option' onClick={() => this._toggleAdvanced(true)} style={{display: 'inline-block', width: 'unset'}}>
                        {LANG.advanced}
                    </div>
                    {this.state.isAdvancedPanelOpen ? advancedPanel : ''}
                </div>
            );
        }

        _setEndPreview(endPreviewFunction) {
            this.setState({endPreview: endPreviewFunction});
        }

        _renderToolButton(iconName, id, label, onClick, active) {
            let cx = 'tool-btn';
            if (active) {
                cx += ' active';
            }

            const endPreviewAndOnClick = () => {
                if (this.state.endPreview) {
                    this.state.endPreview();
                }
                $('.tool-btn').removeClass('active');
                $(`#left-${id}`).addClass('active');
                onClick();
            }

            return (
                <div id={`left-${id}`} className={cx} title={label} onClick={endPreviewAndOnClick}>
                    <img src={`img/left-bar/icon-${iconName}.svg`} draggable="false"/>
                </div>
            );
        }

        render() {
            return (
                <div className="left-toolbar">
                    {this._renderToolButton('cursor','Cursor', LANG.label.cursor, FnWrapper.useSelectTool, true)}
                    {this._renderToolButton('photo','Photo', LANG.label.photo, FnWrapper.importImage)}
                    {this._renderToolButton('text','Text', LANG.label.text, FnWrapper.insertText)}
                    {this._renderToolButton('rect','Rectangle', LANG.label.rect, FnWrapper.insertRectangle)}
                    {this._renderToolButton('oval','Ellipse', LANG.label.oval, FnWrapper.insertEllipse)}
                    {this._renderToolButton('polygon','polygon', LANG.label.polygon, FnWrapper.insertPolygon)}
                    {this._renderToolButton('draw','Pen', LANG.label.pen, FnWrapper.insertPath)}
                    {this._renderToolButton('grid','Grid', LANG.label.array, FnWrapper.gridArraySelected)}
                    <PreviewButton 
                        passEndPreview={this._setEndPreview}
                    />
                </div>
            );
        }
    } 

    return LeftPanel;
});
