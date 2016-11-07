define([
    'react',
    'helpers/i18n'
], function(
    React,
    i18n
) {

    let lang = i18n.get();

    return React.createClass({

        getInitialState: function() {
            let str = this.props.animationString || '';

            return {
                str,
                counter: 0
            }
        },

        componentDidMount: function() {
            let { interval } = this.props;


            setInterval(() => {
                this.setState(this.next());
            }, interval || 1000);
        },

        next: function() {
            let { animationString, interval } = this.props,
                { counter } = this.state,
                arr, str;

            animationString = animationString || '...';
            interval = interval || 1000;
            str = animationString.split('').slice(0, this.state.counter).join('');
            counter = (counter + 1) % (animationString.length + 1) === 0 ? 0 : counter + 1;
            return {
                str, counter
            }
        },

        render: function() {
            return (
                <div className="processing">
                    <label>{lang.general.wait + this.state.str}</label>
                </div>
            );
        }
    });
});
