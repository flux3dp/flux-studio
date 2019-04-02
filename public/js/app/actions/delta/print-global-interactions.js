define([
    'app/actions/global-interaction',
], function (
    GlobalInteraction,
) {
    class PrintGlobalInteraction extends GlobalInteraction {
        constructor() {
            super();
            this._actions = {
                'IMPORT': () => {
                    if (electron) {
                        electron.trigger_file_input_click('stl_import');
                    }
                },
                'SAVE_SCENE': () => this._instance.reactSrc._handleDownloadScene(),
                'EXPORT_FLUX_TASK': () => this._instance.downloadFCode(),
                'UNDO': () => this._instance.undo(),
                'DUPLICATE': () => this._instance.duplicateSelected(),
                'ROTATE': () => this._instance.reactSrc._handleModeChange('rotate'),
                'SCALE': () => this._instance.reactSrc._handleModeChange('scale'),
                'RESET': () => this._instance.resetObject(),
                'ALIGN_CENTER': () => this._instance.alignCenterPosition(),
                'CLEAR_SCENE': () => this._instance.clearScene(),
                'TUTORIAL': () => this._instance.reactSrc._startTutorial(),
            };
        }
        attach(instance) {
            this._instance = instance;
            super.attach(['IMPORT', 'TUTORIAL']);
        }
        onObjectFocus() {
            this.enableMenuItems(['DUPLICATE', 'SCALE', 'ROTATE', 'RESET', 'ALIGN_CENTER']);
        }
        onObjectBlur() {
            this.disableMenuItems(['DUPLICATE', 'SCALE', 'ROTATE', 'RESET', 'ALIGN_CENTER']);
        }
        onObjectChanged(canUndo) {
            if (canUndo) {
                this.enableMenuItems(['UNDO']);
            } else {
                this.disableMenuItems(['UNDO']);
            }
        }
        onSceneImport() {
            this.enableMenuItems(['CLEAR_SCENE', 'SAVE_SCENE', 'EXPORT_FLUX_TASK']);
        }
        onSceneClear() {
            this.disableMenuItems(['CLEAR_SCENE', 'SAVE_SCENE', 'EXPORT_FLUX_TASK']);
        }
    }

    const instance = new PrintGlobalInteraction();

    return instance;
});
