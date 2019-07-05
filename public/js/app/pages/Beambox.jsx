define([
    'react',
    'app/actions/beambox/beambox-init',
    'app/actions/beambox/beambox-global-interaction',
    'app/actions/beambox/beambox-preference',
    'jsx!views/beambox/Left-Panels/Left-Panel',
    'jsx!pages/svg-editor',
], function (
    React,
    BeamboxInit,
    BeamboxGlobalInteraction,
    BeamboxPreference,
    LeftPanel,
    SvgEditor
) {
    BeamboxInit.init();

    class view extends React.Component {
        componentDidMount() {
            BeamboxGlobalInteraction.attach();

            // need to run after svgedit packages loaded, so place it at componentDidMouont
            if (BeamboxPreference.read('show_guides')) {
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
                    <div id='object-panels-placeholder' />
                    <div id='image-trace-panel-placeholder' />
                </div>
            );
        }
    }
    return () => view;
});
