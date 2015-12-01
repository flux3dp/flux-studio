define([
    'react',
    'jsx!widgets/Button-Group'
], function(React, ButtonGroup) {
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                lang: {},
                scanUpperLimit: 5,
                meshes: [],
                scanTimes: 0,
                className: {},
                hasConvert: false,
                onScanClick: function() {}, // scan/multi scan
                onSaveClick: function() {}, // save as stl
                onRollbackClick: function() {}, // rollback to pcd
                onConvertClick: function() {},  // convert from point cloud to stl
                onScanAgainClick: function() {} // start over
            };
        },

        _getActionButtons: function(lang) {
            var self = this,
                buttons = [],
                cx = React.addons.classSet,
                className;

            // has been scan but doesn't convert
            if (0 < self.props.scanTimes && false === self.props.hasConvert) {
                buttons.push({
                    label: lang.scan.scan_again,
                    className: 'btn-action btn-hexagon btn-scan-again',
                    onClick: self.props.onScanAgainClick
                });
                className = {
                    'btn-action': true,
                    'btn-hexagon': true,
                    'btn-multi-scan': true,
                    'btn-disabled': (this.props.scanUpperLimit === this.props.meshes.length)
                };
                buttons.push({
                    label: lang.scan.start_multiscan,
                    className: cx(className),
                    onClick: self.props.onScanClick
                });
                buttons.push({
                    label: lang.scan.convert_to_stl,
                    className: 'btn-action btn-hexagon btn-convert',
                    onClick: self.props.onConvertClick
                });

                if (true === window.FLUX.debug) {
                    buttons.push({
                        label: 'Save PCD',
                        className: 'btn-action btn-hexagon btn-save-pcd',
                        onClick: self.props.onSaveClick
                    });
                }
            }
            // has been scan and does convert
            else if (0 < self.props.scanTimes && true === self.props.hasConvert) {
                buttons.push({
                    label: lang.scan.scan_again,
                    className: 'btn-action btn-hexagon btn-scan-again',
                    onClick: self.props.onScanAgainClick
                });
                buttons.push({
                    label: lang.scan.rollback,
                    className: 'btn-action btn-hexagon btn-rollback',
                    onClick: self.props.onRollbackClick
                });
                buttons.push({
                    label: lang.scan.do_save,
                    className: 'btn-action btn-hexagon btn-save-stl',
                    onClick: self.props.onSaveClick
                });
            }
            // nothing started
            else {
                buttons.push({
                    label: lang.scan.go,
                    className: 'btn-action btn-hexagon btn-scan',
                    onClick: self.props.onScanClick
                });
            }

            return buttons;
        },

        render : function() {
            var lang = this.props.lang,
                buttons = this._getActionButtons(lang),
                cx = React.addons.classSet,
                defaultClassName = cx(this.props.className);

            return (
                <ButtonGroup className={defaultClassName} buttons={buttons}/>
            );
        }
    });
});