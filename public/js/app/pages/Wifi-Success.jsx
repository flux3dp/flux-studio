define([
    'jquery',
    'react',
    'jsx!widgets/Modal'
], function($, React, Modal) {
    'use strict';

    return function(args) {
        args = args || {};

        var Page = React.createClass({
            getInitialState: function() {
                return args.state;
            },
            render : function() {
                var lang = this.state.lang,
                    content = (
                        <div className="wifi initialization absolute-center text-center">
                            <h1>{lang.welcome_headline}</h1>
                            <img className="wifi-symbol" src="/img/img-wifi-unlock.png"/>
                            <div className="wifi-form">
                                <h2>{lang.wifi.success.caption}</h2>
                                <p>{lang.wifi.success.line1}</p>
                                <div>
                                    <a href="#initialize/wifi/set-printer" className="btn btn-action btn-large">{lang.wifi.success.next}</a>
                                </div>
                            </div>
                        </div>
                    );

                return (
                    <Modal content={content}/>
                );
            }
        });

        return Page;
    };
});