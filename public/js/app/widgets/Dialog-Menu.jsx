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
        getInitialState: function() {
            return {
                isItemsChecked: Array(this.props.items.length).fill(false)
            };
        },


        toggleSubPopup: function(itemIndex, isChecked) {
            const newIsItemsCheckedState = Array(...this.state.isItemsChecked); //copy array
            newIsItemsCheckedState[itemIndex] = isChecked;
            this.setState({
                isItemsChecked: newIsItemsCheckedState
            });
        },

        _renderItem: function() {
            const arrowClassName = ReactCx.cx({
                'arrow': true,
                'arrow-left': 'LEFT' === this.props.arrowDirection,
                'arrow-right': 'RIGHT' === this.props.arrowDirection,
                'arrow-up': 'UP' === this.props.arrowDirection,
                'arrow-bottom': 'BOTTOM' === this.props.arrowDirection,
            });

            return this.props.items
                .filter(item => !!item.label)
                .map((item, index) => {
                    let disablePopup = false;
                    if(item.disable || !item.content) {
                        disablePopup = true;
                    }

                    let itemLabelClassName = {
                        'dialog-label': true,
                        'disable': item.disable === true
                    };
                    itemLabelClassName = Object.assign(itemLabelClassName, item.labelClass || {});
                    const checked = item.forceKeepOpen || (this.state.isItemsChecked[index] && !disablePopup);
                    return {
                        label: (
                            <label className='ui-dialog-menu-item'>
                                <input
                                    name='dialog-opener'
                                    className='dialog-opener'
                                    type='checkbox'
                                    disabled={disablePopup}
                                    checked={checked}
                                    onClick={e => {
                                        if (!item.forceKeepOpen) {
                                            this.toggleSubPopup(index, e.target.checked);
                                        }
                                    }}
                                />
                                <div className={ReactCx.cx(itemLabelClassName)}>
                                    {item.label}
                                </div>
                                <label className='dialog-window'>
                                    <div className={arrowClassName}/>
                                    <div className='dialog-window-content'>
                                        {item.content}
                                    </div>
                                </label>
                            </label>
                        )
                    };
                });
        },

        // Lifecycle
        render: function() {
            const className = this.props.className;
            className['ui ui-dialog-menu'] = true;

            return (
                <List
                    ref="uiDialogMenu"
                    items={this._renderItem()}
                    className={ReactCx.cx(className)}
                />
            );
        }
    });
});
