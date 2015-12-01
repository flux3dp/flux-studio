define([
    'jquery',
    'react',
    'jsx!widgets/List'
],
function(
    $,
    React,
    List
) {
    'use strict';

    return React.createClass({
        propTypes: {
            Direction: React.PropTypes.oneOf(['LEFT', 'RIGHT', 'UP', 'BOTTOM']),
            className: React.PropTypes.object,
            items: React.PropTypes.array
        },

        getDefaultProps: function() {
            return {
                arrowDirection: 'LEFT',
                className: {},
                items: []
            };
        },

        toggleSubPopup: function(e) {
            var $wrapper = $(this.refs.uiDialogMenu.getDOMNode()),
                $me = $(e.currentTarget).find('.dialog-opener'),
                $popupOpen = $wrapper.find('.dialog-opener:checked').not($me);

            $popupOpen.removeAttr('checked');
        },

        _renderItem: function() {
            var self = this,
                items = self.props.items,
                cx = React.addons.classSet,
                arrowClassName = cx({
                    'arrow': true,
                    'arrow-left': 'LEFT' === self.props.arrowDirection,
                    'arrow-right': 'RIGHT' === self.props.arrowDirection,
                    'arrow-up': 'UP' === self.props.arrowDirection,
                    'arrow-bottom': 'BOTTOM' === self.props.arrowDirection,
                }),
                listItems = [],
                disablePopup = false;

            items.forEach(function(opt, i) {
                if (opt.content) {
                    disablePopup = false;
                }
                else {
                    disablePopup = true;
                }

                if (opt.label) {
                    listItems.push({
                        label: (
                            <label className="ui-dialog-menu-item" onClick={self.toggleSubPopup}>
                                <input
                                    name="dialog-opener"
                                    className="dialog-opener"
                                    type="checkbox"
                                    disabled={disablePopup}
                                />
                                <div className="dialog-label">
                                    {opt.label}
                                </div>
                                <label className="dialog-window">
                                    <svg className={arrowClassName} version="1.1" xmlns="http://www.w3.org/2000/svg"
                                        width="46.8" height="30">
                                        <polygon points="0,15 46.8,0 46.8,30"/>
                                    </svg>
                                    <div className="dialog-window-content">
                                        {opt.content}
                                    </div>
                                </label>
                            </label>
                        )
                    });
                }
            });

            return listItems;
        },

        // Lifecycle
        render: function() {
            var self = this,
                props = self.props,
                cx = React.addons.classSet,
                className = props.className,
                items = this._renderItem();

            className['ui ui-dialog-menu'] = true;

            return (
                <List
                    ref="uiDialogMenu"
                    items={items}
                    className={cx(className)}
                />
            );
        }
    });
});