define(['react'], function(React){
    'use strict';

    return React.createClass({

        render: function() {

            var list_items = this.props.items.map(function(opt, i){
                return <li>{opt.label}</li>;
            }, this);

            return  <ul
                        name={this.props.name}
                        id={this.props.id}
                        className={this.props.className}
                    >
                        {list_items}
                    </ul>;
        }
    });
});