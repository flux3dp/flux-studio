define([
    'react',
    'helpers/i18n',
    'helpers/device-master',
    'helpers/device-error-handler'
], function(
    React,
    i18n,
    DeviceMaster,
    DeviceErrorHandler
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return ({error, clear}) => {

        const _handleBackToList = () => {
            clear();
            setTimeout(() => {
                location.hash = '#studio/cloud/bind-machine';
            }, 10);
        };

        const _handleCancel = () => location.hash = '#studio/print';

        const message = Boolean(error) ?
            DeviceErrorHandler.translate(error) :
            LANG.binding_error_description;

        return(
            <div className="cloud bind-success">
                <div className="container">
                    <div className="title">
                        <h3>{LANG.binding_fail}</h3>
                        <label>{message}</label>
                    </div>
                    <div className="icon">
                        <img src="img/error-icon.svg" />
                    </div>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-cancel" onClick={_handleCancel}>{LANG.cancel}</button>
                        <button className="btn btn-default" onClick={_handleBackToList}>{LANG.back_to_list}</button>
                    </div>
                </div>
            </div>
        );
    };
});
