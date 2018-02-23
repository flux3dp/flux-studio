define([
    'jquery',
    'react',
    'reactDOM',
    'reactPropTypes',
    'reactClassset',
    'jsx!widgets/List',
    // non-return
    'helpers/object-assign'
],
function(
    $,
    React,
    ReactDOM,
    PropTypes,
    ReactCx,
    List
) {
    'use strict';

    return React.createClass({
        propTypes: {
            arrowDirection: PropTypes.oneOf(['LEFT', 'RIGHT', 'UP', 'BOTTOM']),
            className: PropTypes.object,
            items: PropTypes.array
        },

        getDefaultProps: function() {
            return {
                arrowDirection: 'LEFT',
                className: {},
                items: []
            };
        },

        toggleSubPopup: function(disable, e) {
            var $wrapper = $(ReactDOM.findDOMNode(this.refs.uiDialogMenu)),
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
                arrowClassName = ReactCx.cx({
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
                                <div className={ReactCx.cx(itemLabelClassName)}>
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
                className = props.className,
                items = this._renderItem();

            className['ui ui-dialog-menu'] = true;

            return (
                <List
                    ref="uiDialogMenu"
                    items={items}
                    className={ReactCx.cx(className)}
                />
            );
        }
    });
});
