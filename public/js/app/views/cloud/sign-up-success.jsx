define([
    'react',
    'helpers/i18n'
], function(
    React,
    i18n
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return () => {
        const _handleSignIn = () => location.hash = '#studio/cloud/sign-in';

        return(
            <div className="cloud">
                <div className="container">
                    <div className="icon">
                        <img src="http://placehold.it/150x150" />
                    </div>
                    <div className="title no-margin">
                        <h3>{LANG.sign_up}</h3>
                        <h2>{LANG.success}</h2>
                    </div>
                    <div className="description">
                        <label>{LANG.pleaseSignIn}</label>
                    </div>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-default" onClick={_handleSignIn}>{LANG.sign_in}</button>
                    </div>
                </div>
            </div>
        );
    };
});
