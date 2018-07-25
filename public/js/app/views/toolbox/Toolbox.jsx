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
    const LANG = i18n.lang.Toolbox;

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
                        <ToolboxItem onClick={FnWrapper.alignLeft} src="img/icon_alignment-left.png" />
                        <ToolboxItem onClick={FnWrapper.alignRight} src="img/icon_alignment-right.png" />
                        <ToolboxItem onClick={FnWrapper.alignCenter} src="img/icon_alignment-centered-horizontally.png" />
                        <ToolboxItem onClick={FnWrapper.alignTop} src="img/icon_alignment-top.png" />
                        <ToolboxItem onClick={FnWrapper.alignMiddle} src="img/icon_alignment-centered-vertically.png" />
                        <ToolboxItem onClick={FnWrapper.alignBottom} src="img/icon_alignment-bottom.png" />
                    </div>
                );
            }
            if (this.state.showDistribute) {
                distributeToolbox = (
                    <div className="Toolbox-content">
                        <ToolboxItem onClick={FnWrapper.distHori} src="img/distribute_horizontal_center.png" />
                        <ToolboxItem onClick={FnWrapper.distVert} src="img/distribute_vertical_center.png" />
                        <ToolboxItem onClick={FnWrapper.distEven} src="img/diffusion2.png" />
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
