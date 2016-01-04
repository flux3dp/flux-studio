define([
    'react',
    'jsx!widgets/Button-Group'
], function(React, ButtonGroup) {
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                // mode: NOT_SCAN, SCANNED, MULTI_SCAN, CONVERTED
                mode: 'NOT_SCAN',
                lang: {},
                className: {},
                hasConvert: false,
                disabledScan: false,
                onScanClick: function() {}, // scan/multi scan
                onSaveClick: function() {}, // save as stl
                onRollbackClick: function() {}, // rollback to pcd
                onConvertClick: function() {},  // convert from point cloud to stl
                onScanAgainClick: function() {}, // start over
                onMultiScanClick: function() {}, // ready to multi scan
                onCancelMultiScanClick: function() {}   // cancel multi scan
            };
        },

        _getActionButtons: function(lang) {
            var self = this,
                buttons = [],
                cx = React.addons.classSet,
                className;

            switch (self.props.mode) {
            case 'NOT_SCAN':
                buttons.push({
                    label: lang.scan.go,
                    className: 'btn-action btn-hexagon btn-scan',
                    dataAttrs: {
                        'ga-event': 'go-scan'
                    },
                    onClick: self.props.onScanClick
                });
                break;
            case 'SCANNED':
                buttons.push({
                    label: lang.scan.scan_again,
                    className: 'btn-action btn-hexagon btn-scan-again',
                    dataAttrs: {
                        'ga-event': 'scan-again'
                    },
                    onClick: self.props.onScanAgainClick
                });

                className = {
                    'btn-action': true,
                    'btn-hexagon': true,
                    'btn-multi-scan': true,
                    'btn-disabled': (true === this.props.disabledScan)
                };

                buttons.push({
                    label: lang.scan.start_multiscan,
                    className: cx(className),
                    dataAttrs: {
                        'ga-event': 'going-to-multiscan'
                    },
                    onClick: self.props.onMultiScanClick
                });
                buttons.push({
                    label: lang.scan.convert_to_stl,
                    className: 'btn-action btn-hexagon btn-convert',
                    dataAttrs: {
                        'ga-event': 'convert-to-stl'
                    },
                    onClick: self.props.onConvertClick
                });
                break;
            case 'CONVERTED':
                buttons.push({
                    label: lang.scan.scan_again,
                    className: 'btn-action btn-hexagon btn-scan-again',
                    dataAttrs: {
                        'ga-event': 'scan-again'
                    },
                    onClick: self.props.onScanAgainClick
                });
                buttons.push({
                    label: lang.scan.rollback,
                    className: 'btn-action btn-hexagon btn-rollback',
                    dataAttrs: {
                        'ga-event': 'rollback'
                    },
                    onClick: self.props.onRollbackClick
                });
                buttons.push({
                    label: lang.scan.do_save,
                    className: 'btn-action btn-hexagon btn-save-stl',
                    dataAttrs: {
                        'ga-event': 'save-stl'
                    },
                    onClick: self.props.onSaveClick
                });
                break;
            case 'MULTI_SCAN':
                className = {
                    'btn-action': true,
                    'btn-hexagon': true,
                    'btn-multi-scan': true
                };

                buttons.push({
                    label: lang.scan.cancel,
                    className: 'btn-action btn-hexagon btn-cancel',
                    dataAttrs: {
                        'ga-event': 'cancel-multiscan'
                    },
                    onClick: self.props.onCancelMultiScanClick
                });
                buttons.push({
                    label: lang.scan.start_multiscan,
                    className: cx(className),
                    dataAttrs: {
                        'ga-event': 'go-to-multiscan'
                    },
                    onClick: self.props.onScanClick
                });
                break;
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