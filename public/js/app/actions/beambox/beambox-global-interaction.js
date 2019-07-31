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
                'IMPORT_EXAMPLE': () => {
                    var fileEntry = {
                        name: 'examples/badge.bvg',
                        toURL: function() {
                            return 'examples/badge.bvg';
                        }
                    }
                    var oReq = new XMLHttpRequest();
                    oReq.open('GET', 'examples/badge.bvg', true);
                    oReq.responseType = 'blob';

                    oReq.onload = function(oEvent) {
                        svgEditor.importBvg(oReq.response);
                    };

                    oReq.send();
                },
                'IMPORT_MATERIAL_TESTING': () => {
                    var fileEntry = {
                        name: 'examples/mat_test.bvg',
                        toURL: function() {
                            return 'examples/mat_test.bvg';
                        }
                    }
                    var oReq = new XMLHttpRequest();
                    oReq.open('GET', 'examples/mat_test.bvg', true);
                    oReq.responseType = 'blob';

                    oReq.onload = function(oEvent) {
                        svgEditor.importBvg(oReq.response);
                    };

                    oReq.send();
                },
                'SAVE_SCENE': () => FnWrapper.saveFile(),
                'EXPORT_FLUX_TASK': () => BottomRightFuncs.exportFcode(),
                'UNDO': () => FnWrapper.undo(),
                'DUPLICATE': () => FnWrapper.cloneSelectedElement(),
                'ROTATE': () => {},
                'SCALE': () => {},
                'RESET': () => {},
                'ALIGN_CENTER': () => {},
                'CLEAR_SCENE': () => {window.svgEditorClearScene()},
                'TUTORIAL': () => {}
            };
        }
        attach() {
            super.attach(['IMPORT', 'SAVE_SCENE', 'UNDO', 'EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
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
