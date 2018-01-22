define([
    'react',
    'app/actions/beambox/beambox-init',
    'app/actions/beambox/beambox-global-interaction',
    'jsx!views/beambox/Left-Panel',
    'jsx!views/beambox/Bottom-Right-Panel',
    'jsx!pages/svg-editor',
], function (
    React,
    BeamboxInit,
    BeamboxGlobalInteraction,
    LeftPanel,
    BottomRightPanel,
    SvgEditor
) {
    BeamboxInit.init();

    class view extends React.Component {
        componentDidMount() {
            BeamboxGlobalInteraction.attach();
        }
        componentWillUnmount() {
            BeamboxGlobalInteraction.detach();
        }

        render() {
            return (
                <div className="studio-container beambox-studio">
                    <div id='grid_mask' />
                    <LeftPanel />
                    <SvgEditor />
                    <BottomRightPanel />
                    <div id='object-panels-placeholder' />
                </div>
            );
        }
    }
    return () => view;
});
