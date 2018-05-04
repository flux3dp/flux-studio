define([
    'react',
    'helpers/i18n',
], function(
    React,
    i18n
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return () => {
        const _handleDone = () => location.hash = '#studio/cloud';
        return(
            <div className="cloud">
                <div className="container email-sent">
                    <div className="middle">
                        <div className="description">
                            <h3>{LANG.check_inbox}</h3>
                        </div>
                    </div>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-default" onClick={_handleDone}>{LANG.done}</button>
                    </div>
                </div>
            </div>
        );
    };
});
