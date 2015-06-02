define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'css!cssHome/pages/welcome'
], function($, React, i18n, SelectView) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            HomeView;

        HomeView = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            render : function() {
                return (
                    <div className="welcome initialization absolute-center text-center">
                        <h1>{this.state.lang.welcome_headline}</h1>
                        <img className="brand-image" src="/img/wel-flux-logo.png"/>
                        <div>
                            <h2>{this.state.lang.welcome.header1}</h2>
                            <p>{this.state.lang.welcome.header2}</p>
                            <div>
                                <SelectView id="select-lang" options={options}/>
                            </div>
                            <div>
                                <a href="#initialize/wifi/ask" className="btn btn-large">{this.state.lang.welcome.start}</a>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return HomeView;
    };
});