define([
    'jquery',
    'react',
    'helpers/i18n',
    'jsx!views/settings/Setting-Menuless-Top-Nav',
    'css!cssHome/pages/settings'
], function($, React, i18n, TopNav) {
    'use strict';

    return function(args) {
        args = args || {};

        var options = [],
            selectedId,
            View = React.createClass({
                _selectConnection: function(e, arg) {
                    selectedId = e.target.attributes['id'].value;
                    var _root = $(e.target).parents('.connections');

                    // remove selected
                    $('.active', $(_root)).removeClass('active');
                    $(e.target).addClass('active');
                },
                render : function() {
                    var lang = args.state.lang;

                    return (
                        <div className="connect-printer">
                            <TopNav lang={lang} hideBack={true}/>
                            <div className="connection-list">
                                <div className="title">{lang.settings.connect_printer.title}</div>
                                <div className="connections">
                                    <div className="connection">
                                        <div className="name font2">FLUX 3D Printer Li</div>
                                        <div className="select" id="li" onClick={this._selectConnection}></div>
                                    </div>
                                    <div className="connection">
                                        <div className="name font2">FLUX 3D Printer Si</div>
                                        <div className="select" id="si" onClick={this._selectConnection}></div>
                                    </div>
                                    <div className="connection">
                                        <div className="name font2">FLUX 3D Printer Cu</div>
                                        <div className="select" id="cu" onClick={this._selectConnection}></div>
                                    </div>
                                </div>
                                <div className="actions">
                                    <a className="btn btn-default-dark btn-long">{lang.settings.done}</a>
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

        return View;
    };
});