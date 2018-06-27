define([
    'react',
    'jsx!widgets/Control',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/film-cutter/record-manager',
    'app/actions/alert-actions',
], function(
    React,
    Control,
    FilmCutterCloud,
    RecordManager,
    AlertActions
) {
    const Row = ({children}) => (
        <div className='row' style={{display: 'flex',justifyContent: 'center', width: '600px', marginLeft: '150px'}}>
            {children}
        </div>
    );
    const Field = ({title, content}) => (
        <div style={{color: '#888', minWidth: '300px', width: '100%', textAlign: 'left',}}>
            <strong style={{paddingRight: '15px'}}>{title}:</strong>
            <span>{content}</span>
        </div>
    );

    return MyAccount = () => {
        if (!RecordManager.read('password')) {
            AlertActions.showPopupInfo('my-account', '請先登入');
            location.hash = '#/studio/beambox';
            return;
        }
        const isOnLine = navigator.onLine;
        const data = {
            account:                    RecordManager.read('account'),
            name:                       `${RecordManager.read('last_name')}${RecordManager.read('first_name')}`,
            shop_name:                  RecordManager.read('shop_name'),
            shop_address:               RecordManager.read('shop_address'),
            usage_cut_overall:          RecordManager.read('usage_cut_overall_on_cloud'),
            usage_cut_used:             RecordManager.read('usage_cut_used_on_cloud') + RecordManager.read('usage_cut_recorded'),
            usage_download:             new Date(RecordManager.read('usage_download')).toDateString(),
            machine_pi_serial_number:   RecordManager.read('machine_pi_serial_number'),
            last_connect_to_cloud:      new Date(RecordManager.read('last_connect_to_cloud')).toDateString(),
        };
        const handleChangePasswordClick = () => {
            if (!isOnLine) {
                AlertActions.showPopupError('my-account', '請先連網');
                return;
            }
            location.hash = '#studio/cloud/change-password';
        };
        const handlebindMachineClick = () => {
            if (!isOnLine) {
                AlertActions.showPopupError('my-account', '請先連網');
                return;
            }
            if (RecordManager.read('machine_pi_serial_number')) {
                AlertActions.showPopupError('my-account', '已綁定機器，如要更換機器，請聯繫客服');
                return;
            }
            location.hash = '#studio/cloud/bind-machine';
        };
        return (
            <div className="cloud">
                <div className="container">
                    <div className="title">
                        <h3>{'我的帳戶'}</h3>
                    </div>
                    <Row>
                        <Field title='帳號' content={data.account}/>
                        <Field title='姓名' content={data.name}/>
                    </Row>
                    <Row className='row'>
                        <Field title='店名' content={data.shop_name}/>
                        <Field title='店址' content={data.shop_address}/>
                    </Row>
                    <Row className='row'>
                        <Field title='最大可切割次數' content={`${data.usage_cut_overall} 次`}/>
                        <Field title='已切割次數' content={`${data.usage_cut_used} 次`}/>
                    </Row>
                    <Row className='row'>
                        <Field title='數據下載期限' content={data.usage_download}/>
                    </Row>
                    <Row className='row'>
                        <Field title='機器序號' content={data.machine_pi_serial_number}/>
                    </Row>
                    <Row className='row'>
                        <Field title='最後同步時間' content={data.last_connect_to_cloud}/>
                    </Row>
                    <button style={{width: '170px'}} className="btn btn-default" onClick={handleChangePasswordClick}>{'變更密碼'}</button>
                    <button style={{width: '170px'}} className="btn btn-default" onClick={handlebindMachineClick}>{'綁定機器'}</button>
                </div>
                <div className="footer">
                    <div className="divider">
                        <hr />
                    </div>
                    <div className="actions">
                        <button className="btn btn-default" onClick={() => location.hash = '#studio/beambox'}>{'關閉'}</button>
                    </div>
                </div>
            </div>
        );

    };
});
