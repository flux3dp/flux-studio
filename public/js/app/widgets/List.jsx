define(['react'], function(React){
    'use strict';

    return React.createClass({

        getDefaultProps: function() {
            return {
                name: '',
                id: '',
                emptyMessage: ''
                className: '',
                items: [],
                onClick: function() {},
                ondblclick: function() {}
            };
        },

        render: function() {

            var list_items = this.props.items.map(function(opt, i){
                var metadata = JSON.stringify(opt.data);

                return <li data-meta={metadata} data-value={opt.value}>{opt.label}</li>;
            }, this);

            return  (
                <ul
                    name={this.props.name}
                    id={this.props.id}
                    className={this.props.className}
                    data-empty-message={this.props.emptyMessage}
                    onClick={this.props.onClick}
                    onDoubleClick={this.props.ondblclick}>
                    {list_items}
                </ul>
            );
        }
    });
});