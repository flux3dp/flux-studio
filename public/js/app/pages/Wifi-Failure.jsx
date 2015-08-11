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
                                <h2>{lang.wifi.failure.caption}</h2>
                                <p>{lang.wifi.failure.line1}</p>
                                <div>
                                    <a href="#initialize/wifi/select" className="btn btn-action btn-large">{lang.wifi.failure.next}</a>
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