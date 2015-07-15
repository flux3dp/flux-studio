define([
    'react',
    'jquery',
    'helpers/display'
], function(React, $, display) {
    'use strict';

    return function(view, args) {
        args = args || {};
        args.disabledEscapeOnBackground = (
            'boolean' === typeof args.disabledEscapeOnBackground
            ? args.disabledEscapeOnBackground
            : false
        );
        args.onClose = args.onClose || function() {};

        var View = view(args),
            $root = $('.popup-window'),
            PopupComponent = React.createClass({
                getInitialState: function() {
                    return args.state;
                },

                componentDidMount: function() {
                    $root.show();
                },

                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div>
                            <div className="popup-background" onClick={this._closeOnBackground}/>
                            <View/>
                        </div>
                    );
                },

                // ui events
                _closeOnBackground: function(e) {
                    if (false === args.disabledEscapeOnBackground) {
                        methods.close();
                    }
                }

            }),
            factory = function() {
                return PopupComponent;
            },
            methods = {
                /**
                 * show popup
                 */
                open: function() {
                    display(factory, args, $root[0]);
                },
                /**
                 * destroy and hide
                 */
                close: function() {
                    $root.find('.popup-background').remove();
                    $root.hide();

                    args.onClose();
                }
            };

        return methods;
    };
});