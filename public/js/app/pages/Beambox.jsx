define([
    'react',
    'helpers/api/config',
    'app/actions/beambox/beambox-init',
    'app/actions/beambox/beambox-global-interaction',
    'jsx!views/beambox/Left-Panels/Left-Panel',
    'jsx!views/beambox/Bottom-Right-Panel',
    'jsx!pages/svg-editor',
], function (
    React,
    Config,
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

            // need to run after svgedit packages loaded, so place it at componentDidMouont
            if (Config().read('beambox-preference')['show_guides']) {
                BeamboxInit.displayGuides();
            }
        }
        componentWillUnmount() {
            BeamboxGlobalInteraction.detach();
        }

        render() {
            return (
                <div className="studio-container beambox-studio">
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
