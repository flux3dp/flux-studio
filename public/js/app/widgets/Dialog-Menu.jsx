define([
    'jquery',
    'react',
    'reactDOM',
    'reactPropTypes',
    'reactClassset',
    'app/stores/global-store',
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
    GlobalStore,
    List
) {
    return React.createClass({
        propTypes: {
            arrowDirection: PropTypes.oneOf(['LEFT', 'RIGHT', 'UP', 'BOTTOM']),
            className: PropTypes.object,
            items: PropTypes.array
        },

        componentDidMount: function() {
            GlobalStore.onResetDialogMenuIndex(() => this.resetCheckedItem());
        },

        componentWillUnmount: function() {
            GlobalStore.removeResetDialogMenuIndexListener(() => this.resetCheckedItem());
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
                checkedItem: -1
            };
        },

        resetCheckedItem: function() {
            this.setState({ checkedItem: -1 });
        },

        toggleSubPopup: function(itemIndex, isChecked) {
            this.setState({
                checkedItem: isChecked ? itemIndex : -1
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
                    const {
                        content,
                        disable,
                        forceKeepOpen,
                        label,
                        labelClass,
                        previewOn
                    } = item;
                    const { checkedItem } = this.state;
                    const disablePopup = (disable || !content);
                    const checked = (forceKeepOpen || previewOn) || ((checkedItem === index) && !disablePopup);

                    let itemLabelClassName = {
                        'dialog-label': true,
                        'disable': disable === true
                    };

                    itemLabelClassName = Object.assign(itemLabelClassName, labelClass || {});

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
                                        if (!forceKeepOpen) {
                                            this.toggleSubPopup(index, e.target.checked);
                                        }
                                    }}
                                />
                                <div className={ReactCx.cx(itemLabelClassName)}>
                                    {label}
                                </div>
                                <label className='dialog-window'>
                                    <div className={arrowClassName}/>
                                    <div className='dialog-window-content'>
                                        {content}
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
