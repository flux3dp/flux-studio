define([
    'react',
    'helpers/i18n',
    'helpers/sprintf',
], function(
    React,
    i18n,
    Sprintf
) {
    const LANG = i18n.lang.settings.flux_cloud;
    return () => {
        const _handleCancel = () => location.hash = '#studio/print';
        const _handleRetry= () => location.hash = '#studio/cloud/sign-up';

        return(
            <div className="cloud">
                <div className="container">
                    <div className="icon">
                        <img src="http://placehold.it/150x150" />
                    </div>
                    <div className="title no-margin">
                        <h3>{LANG.sign_up}</h3>
                        <h2>{LANG.fail}</h2>
                    </div>
                    <div className="description">
                        <div className="sign-up-description" dangerouslySetInnerHTML={
                            {__html: Sprintf(LANG.try_sign_up_again, '#/studio/cloud/sign-up')}
                        } />
                        {/* <label>{LANG.pleaseSignIn}</label> */}
                    </div>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-cancel" onClick={_handleCancel}>{LANG.cancel}</button>
                        <button className="btn btn-default" onClick={_handleRetry}>{LANG.try_again}</button>
                    </div>
                </div>
            </div>
        );
    };

});
