define([
    'app/actions/global-interaction',
], function (
    GlobalInteraction,
) {
    class HolderGlobalInteraction extends GlobalInteraction {
        constructor() {
            super();
            this._instance = undefined;
            this._actions = {
                'IMPORT': () => {
                    if (electron) {
                        electron.trigger_file_input_click('file-upload-widget')
                    }
                },
                'EXPORT_FLUX_TASK': () => this._instance._handleExportClick('-f'),
                'CLEAR_SCENE': () => this._instance.state.laserEvents.clearScene(),
            }
        }
        attach(instance) {
            this._instance = instance;
            this._hasImage = false;
            super.attach(['IMPORT']);
        }
        onImageChanged(hasImage) {
            if (this._hasImage !== hasImage) {
                this._hasImage = hasImage;
                if (hasImage) {
                    this.enableMenuItems(['EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
                } else {
                    this.disableMenuItems(['EXPORT_FLUX_TASK', 'CLEAR_SCENE']);
                }
            }
        }
        onObjectFocus() {
            this.enableMenuItems(['DUPLICATE']);
        }
        onObjectBlur() {
            this.disableMenuItems(['DUPLICATE']);
        }
    }
    const instance = new HolderGlobalInteraction();

    return instance;
});
