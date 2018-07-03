define([
    'react',
    'helpers/i18n'
], function(
    React,
    i18n
) {
    let LANG = i18n.lang.settings.flux_cloud;

    return () => {
        const _handleBindAnother = () => location.hash = '#studio/cloud/bind-machine';
        const _handleDone = () => location.hash = '#studio/print';

        return(
            <div className="cloud bind-success">
                <div className="container">
                    <div className="title">
                        <h3>{LANG.binding_success}</h3>
                        <label>{LANG.binding_success_description}</label>
                    </div>
                    <div className="icon">
                        <img src="img/ok-icon.svg" />
                    </div>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-cancel" onClick={_handleBindAnother}>{LANG.bind_another}</button>
                        <button className="btn btn-default" onClick={_handleDone}>{LANG.done}</button>
                    </div>
                </div>
            </div>
        );
    };
});
