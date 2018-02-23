define([
    'app/actions/global-interaction',
    'app/actions/beambox/bottom-right-funcs',
    'app/actions/beambox/svgeditor-function-wrapper',
],function(
    GlobalInteraction,
    BottomRightFuncs,
    FnWrapper
){
    class BeamboxGlobalInteraction extends GlobalInteraction {
        constructor() {
            super();
            this._actions = {
                'IMPORT': () => {
                    if(electron) {
                        electron.trigger_file_input_click('import_image');
                    }
                },
                'SAVE_SCENE': () => {},
                'EXPORT_FLUX_TASK': () => BottomRightFuncs.exportFcode(),
                'UNDO': () => FnWrapper.undo(),
                'DUPLICATE': () => FnWrapper.cloneSelectedElement(),
                'ROTATE': () => {},
                'SCALE': () => {},
                'RESET': () => {},
                'ALIGN_CENTER': () => {},
                'CLEAR_SCENE': () => {},
                'TUTORIAL': () => {}
            };
        }
        attach() {
            super.attach(['IMPORT', 'UNDO', 'EXPORT_FLUX_TASK']);
        }
        onObjectFocus() {
            this.enableMenuItems(['DUPLICATE']);
        }
        onObjectBlur() {
            this.disableMenuItems(['DUPLICATE']);
        }
    }
    const instance = new BeamboxGlobalInteraction();

    return instance;
});
