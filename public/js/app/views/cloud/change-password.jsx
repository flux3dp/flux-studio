define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud',
    'jsx!widgets/Control',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/film-cutter/record-manager',
    'app/actions/alert-actions',
], function(
    React,
    i18n,
    CloudApi,
    Control,
    FilmCutterCloud,
    RecordManager,
    AlertActions
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return class ChangePassword extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                // input field
                oldPassword: '',
                password: '',
                rePassword: '',

                // error message
                showOldPasswordUnmatchError: false,
                showPasswordMissingError: false,
                showRePasswordUnmatchError: false,
            };
        }
        handleInputChange(field, value) {
            this.setState({
                [field]: value
            });
        }

        checkValidation() {
            const isOldPasswordUnmatch = () => this.state.oldPassword !== RecordManager.read('password');
            const isPasswordMissing = () => this.state.password === '';
            const isRePasswordUnmatch = () => this.state.password !== this.state.rePassword;

            this.setState({
                showOldPasswordUnmatchError: isOldPasswordUnmatch(),
                showPasswordMissingError: isPasswordMissing(),
                showRePasswordUnmatchError: isRePasswordUnmatch(),
            });

            return (
                !isOldPasswordUnmatch() &&
                !isPasswordMissing() &&
                !isRePasswordUnmatch()
            );
        }

        async handleNextClick() {
            if(this.checkValidation()) {
                try {
                    await FilmCutterCloud.changePassword(this.state.password);
                    RecordManager.write('password', this.state.password);
                    AlertActions.showPopupInfo('change-password', '已成功變更密碼');
                    location.hash = '#studio/cloud/my-account';
                } catch (error) {
                    console.log('error: ', error);
                    AlertActions.showPopupError('change-password', error.message || error.toString());
                }
            }
        }

        render() {
            return (
                <div className="cloud">
                    <div className="container change-password">
                        <div className="title">
                            <h3>重設密碼</h3>
                        </div>
                        <div className='row'>
                            <Control label={'舊密碼'} errorMessage={this.state.showOldPasswordUnmatchError ? '密碼錯誤' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.oldPassword}
                                    onChange={e => this.handleInputChange('oldPassword', e.target.value)}
                                    onBlur={e => this.handleInputChange('oldPassword', e.target.value)}
                                    placeholder={'舊密碼'}
                                />
                            </Control>
                        </div>
                        <div className='row'>
                            <Control label={'新密碼'} errorMessage={this.state.showPasswordMissingError ? '請輸入新密碼' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.password}
                                    onChange={e => this.handleInputChange('password', e.target.value)}
                                    onBlur={e => this.handleInputChange('password', e.target.value)}
                                    placeholder={'新密碼'}
                                />
                            </Control>
                            <Control label={'新密碼確認'} errorMessage={this.state.showRePasswordUnmatchError ? '密碼不符' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.rePassword}
                                    onChange={e => this.handleInputChange('rePassword', e.target.value)}
                                    onBlur={e => this.handleInputChange('rePassword', e.target.value)}
                                    placeholder={'新密碼確認'}
                                />
                            </Control>
                        </div>
                    </div>

                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => {location.hash = '#studio/cloud/my-account'}}>{LANG.back}</button>
                            <button className="btn btn-default" onClick={() => this.handleNextClick()}>重設密碼</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});
