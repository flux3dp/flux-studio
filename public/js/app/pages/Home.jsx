define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'app/actions/welcome',
    'css!cssHome/pages/welcome'
], function($, React, i18n, SelectView, welcomeEvents) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView = React.createClass({
                render : function() {
                    return (
                        <div className="welcome absolute-center">
                            <h1>{this.state.lang.brand_name}</h1>
                            <div className="brand-image"></div>
                            <div>
                                <h2>{this.state.lang.welcome.header1}</h2>
                                <p>{this.state.lang.welcome.header2}</p>
                                <div>
                                    <SelectView id="select-lang" options={options}/>
                                </div>
                                <div>
                                    <a href="#" className="btn">{this.state.lang.welcome.start}</a>
                                </div>
                            </div>
                        </div>
                    )
                },
                getInitialState: function() {
                    return args.state;
                },

                componentDidMount : function() {
                    welcomeEvents(args);
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code]
            });
        }

        return HomeView;
    };
});