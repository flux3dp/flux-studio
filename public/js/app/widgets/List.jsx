define(['react'], function(React){
    'use strict';

    return React.createClass({

        render: function() {

            var list_items = this.props.items.map(function(opt, i){
                var metadata = JSON.stringify(opt.data);

                return <li data-meta={metadata}>{opt.label}</li>;
            }, this);

            return  <ul
                        name={this.props.name}
                        id={this.props.id}
                        className={this.props.className}
                        onClick={this.props.onclick}
                        onDoubleClick={this.props.ondblclick}
                    >
                        {list_items}
                    </ul>;
        }
    });
});