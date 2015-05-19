define([
    'react',
    'jquery',
    'helpers/display'
], function(React, $, display) {
    'use strict';

    return function(view, args) {
        args = args || {};

        var View = view(args),
            $root = $('.popup-window'),
            PopupComponent = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div>
                            <div className="popup-background"/>
                            <View/>
                        </div>
                    );
                },
                getInitialState: function() {
                    return args.state;
                },
                componentDidMount: function() {
                    $root.show();

                    $(this.getDOMNode()).find('.popup-background').one('click', function(e) {
                        methods.close();
                    });
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
                }
            };

        return methods;
    };
});