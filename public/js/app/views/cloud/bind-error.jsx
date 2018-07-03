define([
    'react',
    'helpers/i18n',
    'helpers/device-master'
], function(
    React,
    i18n,
    DeviceMaster
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return () => {

        const _handleDownloadError = async e => {
            e.preventDefault();
            const info = await DeviceMaster.downloadErrorLog();
            saveAs(info[1], 'error-log.txt');
        };

        const _handleCancel = () => location.hash = '#studio/print';

        return(
            <div className="cloud bind-success">
                <div className="container">
                    <div className="title">
                        <h3>{LANG.binding_fail}</h3>
                        <label>{LANG.binding_error_description}</label>
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
                        <button className="btn btn-default" onClick={_handleDownloadError}>{LANG.retrieve_error_log}</button>
                    </div>
                </div>
            </div>
        );
    };
});
