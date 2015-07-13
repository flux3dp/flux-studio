define([
    'react',
    'jquery'
], function(React, $) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                onSmooth: React.PropTypes.func,
                onCropOn: React.PropTypes.func,
                onCropOff: React.PropTypes.func,
                onClearNoise: React.PropTypes.func,
                onDelete: React.PropTypes.func,
                onReset: React.PropTypes.func,
            };
        },
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
        _onDelete: function(e) {
            console.log('delete');
            this.props.onDelete(e);
        },
        _onReset: function(e) {
            console.log('reset');
            this.props.onReset(e);
        },
        render: function() {
            var props = this.props,
                cx = React.addons.classSet,
                lang = props.lang,
                button_class_name = cx({
                    'btn': true,
                    'btn-default': true,
                    'btn-full-width': true
                }),
                wrapper_class_name;

            wrapper_class_name = cx({
                'manipulation-panel' : true,
                'operating-panel' : true,
                'invisible': props.display
            });

            return (
                <div className={wrapper_class_name}>
                    <button ref="button" className={button_class_name} onClick={this._onSmooth}>{lang.scan.manipulation.smooth}</button>
                    <button ref="button" className={button_class_name} onClick={this._onCrop}>{lang.scan.manipulation.crop}</button>
                    <button ref="button" className={button_class_name} onClick={this._onClearNoise}>{lang.scan.manipulation.clear_noise}</button>
                    <button ref="button" className={button_class_name} onClick={this._onDelete}>{lang.scan.manipulation.delete}</button>
                    <button ref="button" className={button_class_name} onClick={this._onReset}>{lang.scan.manipulation.reset}</button>
                </div>
            );
        }

    });
});