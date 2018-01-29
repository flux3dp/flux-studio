// refer to: https://gist.github.com/jbottigliero/7982340,
//           https://github.com/JedWatson/react-select
define(['react', 'reactPropTypes'], function(React, PropTypes){
    'use strict';

    return React.createClass({

        getDefaultProps: function(){
            return {
                multiple: false,
                onChange: PropTypes.func
            };
        },

        render: function() {
            // the default value for the <select> (selected for ReactJS)
            // http://facebook.github.io/react/docs/forms.html#why-select-value
            var defaultValue = this.props.defaultValue;

            var options = this.props.options.map(function(opt, i){

                var metadata = JSON.stringify(opt.data);

                // if this is the selected option, set the <select>'s defaultValue
                if (opt.selected === true || opt.selected === 'selected') {
                    // if the <select> is a multiple, push the values
                    // to an array
                    if (this.props.multiple) {
                        if (defaultValue === undefined) {
                            defaultValue = [];
                        }
                        defaultValue.push( opt.value );
                    } else {
                        // otherwise, just set the value.
                        // NOTE: this means if you pass in a list of options with
                        // multiple 'selected', WITHOUT specifiying 'multiple',
                        // properties the last option in the list will be the ONLY item selected.
                        defaultValue = (defaultValue !== undefined ? defaultValue : opt.value);
                    }
                }

                // attribute schema matches <option> spec; http://www.w3.org/TR/REC-html40/interact/forms.html#h-17.6
                // EXCEPT for 'key' attribute which is requested by ReactJS
                return <option key={i} value={opt.value} label={opt.label} selected={defaultValue === opt.value} data-meta={metadata}>{opt.label}</option>;
            }, this);

            return  <select
                        defaultValue={defaultValue}
                        multiple={this.props.multiple}
                        name={this.props.name}
                        id={this.props.id}
                        className={this.props.className}
                        onChange={this.props.onChange}
                    >
                        {options}
                    </select>;
        }
    });
});