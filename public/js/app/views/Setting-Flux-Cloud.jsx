define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!widgets/Select',
    'css!cssHome/pages/settings'
], function($, React, i18n, SelectView) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            View = React.createClass({
                render : function() {
                    var lang = this.state.lang;

                    return (
                        <div className="form">
                            <div>
                                <label>
                                    {lang.settings.language}
                                    <SelectView id="select-lang" options={options}/>
                                </label>
                            </div>
                            <div>
                                <label>
                                    {lang.settings.notifications}
                                    <select>
                                        <option>None</option>
                                    </select>
                                </label>
                            </div>
                        </div>
                    )
                },

                getInitialState: function() {
                    return args.state;
                }

            });

        for (var lang_code in args.props.supported_langs) {
            options.push({
                value: lang_code,
                label: args.props.supported_langs[lang_code],
                selected: lang_code === i18n.getActiveLang()
            });
        }

        return View;
    };
});