define([
    'react',
    'jquery'
], function(React, $) {
    'use strict';

    return React.createClass({
        _toggleStatus: function(e, onCallback, offCallback) {
            onCallback = onCallback || function() {};
            offCallback = offCallback || function() {};

            var $me = $(e.currentTarget),
                $on_button = $('.manipulation-panel .on').not($me);

            $on_button.removeClass('on');

            if (true === $me.hasClass('on')) {
                $me.removeClass('on');
                offCallback(e);
            }
            else {
                $me.addClass('on');
                onCallback(e);
            }
        },
        _onSmooth: function(e) {
            console.log('smooth');
            this._toggleStatus(e);
            this.props.onSmooth(e);
        },
        _onClearNoise: function(e) {
            console.log('clear noise');
            this.props.onClearNoise(e);
        },
        _onCrop: function(e) {
            console.log('crop');
            this._toggleStatus(
                e,
                this.props.onCropOn,
                this.props.onCropOff
            );
        },
        _onAutoMerge: function(e) {
            console.log('auto merge');
            this.props.onAutoMerge(e);
        },
        _onManualMerge: function(e) {
            console.log('manual merge');
            this.props.onManualMerge(e);
        },
        _onReset: function(e) {
            console.log('reset');
            this.props.onReset(e);
        },
        render: function() {
            var self = this,
                props = self.props,
                cx = React.addons.classSet,
                lang = props.lang,
                basic_class = {
                    'btn': true,
                    'btn-default': true,
                    'btn-full-width': true,
                    'btn-multiline-text': true
                },
                button_class_name = cx(basic_class),
                merge_button_class_name = cx({
                    'btn': true,
                    'btn-default': true,
                    'btn-full-width': true,
                    'btn-multiline-text': true,
                    'btn-disabled': false === props.enableMerge
                }),
                button_merge_text = (
                    true === props.enableAutoMerge ?
                    lang.scan.manipulation.auto_merge :
                    lang.scan.manipulation.manual_merge
                ),
                mergeFunc = (
                    true === props.enableAutoMerge ?
                    self._onAutoMerge :
                    self._onManualMerge
                ),
                wrapper_class_name;

            wrapper_class_name = cx({
                'manipulation-panel' : true,
                'operating-panel' : true,
                'invisible': props.display
            });

            return (
                <div className={wrapper_class_name}>
                    <button data-ga-event="scan-smooth" ref="button" className={button_class_name} onClick={self._onSmooth}>{lang.scan.manipulation.smooth}</button>
                    <button data-ga-event="scan-crop" ref="button" className={button_class_name} onClick={self._onCrop}>{lang.scan.manipulation.crop}</button>
                    <button data-ga-event="scan-delete-noise" ref="button" className={button_class_name} onClick={self._onClearNoise}>{lang.scan.manipulation.clear_noise}</button>
                    <button data-ga-event="scan-merge" ref="button" className={merge_button_class_name} onClick={mergeFunc}>{button_merge_text}</button>
                    <button data-ga-event="scan-reset" ref="button" className={button_class_name} onClick={self._onReset}>{lang.scan.manipulation.reset}</button>
                </div>
            );
        },

        getDefaultProps: function() {
            return {
                onSmooth: React.PropTypes.func,
                onCropOn: React.PropTypes.func,
                onCropOff: React.PropTypes.func,
                onClearNoise: React.PropTypes.func,
                onAutoMerge: React.PropTypes.func,
                onManualMerge: React.PropTypes.func,
                onReset: React.PropTypes.func,
                enableMerge: React.PropTypes.bool,
                enableAutoMerge: React.PropTypes.bool
            };
        }

    });
});