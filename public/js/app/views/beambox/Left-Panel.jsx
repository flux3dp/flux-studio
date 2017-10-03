define([
    'react',
    'jsx!widgets/Unit-Input',
    'jsx!widgets/Slider-Control',
    'jsx!widgets/Dialog-Menu',
    'jsx!views/beambox/Insert-Object-Submenu',
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    UnitInput,
    SliderControl,
    DialogMenu,
    InsertObjectSubmenu,
    FnWrapper,
    ConfigHelper,
    i18n
) {
    'use strict';

    let Config = ConfigHelper(),
        LANG = i18n.lang.beambox.left_panel;

    return React.createClass({

        _renderInsertObject: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{LANG.insert_object}</span>
                    </div>
                ),
                content: (
                    <InsertObjectSubmenu />
                ),
                disable: false
            };
        },

        _renderPreview: function() {
            return {
                label: (
                    <div onClick={FnWrapper.useSelectTool}>
                        <span>{LANG.preview}</span>
                    </div>
                ),
                disable: false
            };

        },

        render: function() {
            let items = [
                    this._renderInsertObject(),
                    this._renderPreview()
                ];

            return (
                <div className="left-panel">
                    <DialogMenu ref="dialogMenu" items={items}/>
                </div>
            );
        }

    });
});