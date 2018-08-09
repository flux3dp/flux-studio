define([
    'react',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/stores/topbar-store',
    'jsx!views/toolbox/Toolbox-Item',
    'helpers/i18n',
], function(
    React,
    FnWrapper,
    TopbarStore,
    ToolboxItem,
    i18n
) {
    const LANG = i18n.lang.beambox.toolbox;

    class Toolbox extends React.Component {
        constructor() {
            super();
            this.state = {
                showAlign: false,
                showDistribute: false
            };
        }

        componentDidMount() {
            TopbarStore.onAlignToolboxShowed(() => this.showAlign());
            TopbarStore.onAlignToolboxClosed(() => this.closeAlign());
            TopbarStore.onDistributeToolboxShowed(() => this.showDistribute());
            TopbarStore.onDistributeToolboxClosed(() => this.closeDistribute());
        }

        componentDidUnMount() {
            TopbarStore.removeAlignToolboxShowedListener(() => this.showAlign());
            TopbarStore.removeAlignToolboxClosedListener(() => this.closeAlign());
            TopbarStore.removeDistributeToolboxShowed(() => this.showDistribute());
            TopbarStore.removeDistributeToolboxClosed(() => this.closeDistribute());
        }

        showDistribute() {
            if (!this.state.showDistribute) {
                this.setState({ showDistribute: true });
            }
        }

        closeDistribute() {
            if (this.state.showDistribute) {
                this.setState({ showDistribute: false });
            }
        }

        showAlign() {
            if (!this.state.showAlign) {
                this.setState({ showAlign: true });
            }
        }

        closeAlign() {
            if (this.state.showAlign) {
                this.setState({ showAlign: false });
            }
        }

        renderElement() {
            let alignToolbox = null,
                distributeToolbox = null;
            if (this.state.showAlign) {
                alignToolbox = (
                    <div className="Toolbox-content">
                        <ToolboxItem onClick={FnWrapper.alignLeft} src="img/beambox/align-left.png" title={LANG.ALIGN_LEFT} />
                        <ToolboxItem onClick={FnWrapper.alignCenter} src="img/beambox/align-center-horizontal.png" title={LANG.ALIGN_CENTER} />
                        <ToolboxItem onClick={FnWrapper.alignRight} src="img/beambox/align-right.png" title={LANG.ALIGN_RIGHT} />
                        <ToolboxItem onClick={FnWrapper.alignTop} src="img/beambox/align-top.png" title={LANG.ALIGN_TOP} />
                        <ToolboxItem onClick={FnWrapper.alignMiddle} src="img/beambox/align-center-vertical.png" title={LANG.ALIGN_MIDDLE} />
                        <ToolboxItem onClick={FnWrapper.alignBottom} src="img/beambox/align-bottom.png" title={LANG.ALIGN_BOTTOM} />
                        
                    </div>
                );
            }
            if (this.state.showDistribute) {
                distributeToolbox = (
                    <div className="Toolbox-content">
                        <ToolboxItem onClick={FnWrapper.distHori} src="img/beambox/arrange-horizontal.png" title={LANG.ARRANGE_HORIZONTAL} />
                        <ToolboxItem onClick={FnWrapper.distVert} src="img/beambox/arrange-vertical.png" title={LANG.ARRANGE_VERTICAL} />
                        <ToolboxItem onClick={FnWrapper.distEven} src="img/beambox/diffusion2.png" title={LANG.ARRANGE_DIAGONAL} />
                    </div>
                );
            }
            if (this.state.showAlign) {
                return (
                    <div className="toolbox">
                        {alignToolbox}
                        {distributeToolbox}
                    </div>
                );
            } else {
                return null;
            }
        }

        render() {
            const renderElement = this.renderElement();
            return renderElement;
        }
    }
    return Toolbox;
});
