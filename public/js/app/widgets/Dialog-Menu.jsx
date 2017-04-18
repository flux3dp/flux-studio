define([
    'jquery',
    'react',
    'jsx!widgets/List',
    // non-return
    'helpers/object-assign'
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

        toggleSubPopup: function(disable, e) {
            var $wrapper = $(this.refs.uiDialogMenu.getDOMNode()),
                $me,
                $popupOpen;

            if (1 === arguments.length) {
                e = disable;
                disable = false;
            }

            if (disable === false) {
                $me = $(e.currentTarget).find('.dialog-opener');
                $popupOpen = $wrapper.find('.dialog-opener:checked').not($me);

                $popupOpen.removeAttr('checked');
            }
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
                disablePopup = false,
                itemLabelClassName;

            items.forEach(function(opt, i) {
                opt.labelClass = opt.labelClass || {};

                if (opt.content) {
                    disablePopup = false;
                }
                else {
                    disablePopup = true;
                }

                if(opt.disable === true) {
                    disablePopup = true;
                }

                itemLabelClassName = {
                    'dialog-label': true,
                    'disable': opt.disable === true
                };

                itemLabelClassName = Object.assign(itemLabelClassName, opt.labelClass);
                if (opt.label) {
                    listItems.push({
                        label: (
                            <label className="ui-dialog-menu-item" onClick={self.toggleSubPopup.bind(null, opt.disable)}>
                                <input
                                    name="dialog-opener"
                                    className="dialog-opener"
                                    type="checkbox"
                                    disabled={disablePopup}
                                />
                                <div className={cx(itemLabelClassName)}>
                                    {opt.label}
                                </div>
                                <label className="dialog-window">
                                    <div className={arrowClassName}/>
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
