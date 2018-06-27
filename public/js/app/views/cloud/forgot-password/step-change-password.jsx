define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud',
    'jsx!widgets/Control',
    'app/actions/film-cutter/film-cutter-cloud',
    'app/actions/alert-actions',
], function(
    React,
    i18n,
    CloudApi,
    Control,
    FilmCutterCloud,
    AlertActions
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return class StepChangePassword extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                // input field
                password: '',
                rePassword: '',

                // error message
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
            const isPasswordMissing = () => this.state.password === '';
            const isRePasswordUnmatch = () => this.state.password !== this.state.rePassword;

            this.setState({
                showPasswordMissingError: isPasswordMissing(),
                showRePasswordUnmatchError: isRePasswordUnmatch(),
            });

            return (
                !isPasswordMissing() &&
                !isRePasswordUnmatch()
            );
        }

        async handleNextClick() {
            if(this.checkValidation()) {
                try {
                    await FilmCutterCloud.forgetPassword(this.props.phone, this.state.password, this.props.code);
                    AlertActions.showPopupInfo('change-password', '已成功變更密碼');
                    location.hash = '#studio/cloud/sign-in';
                } catch (error) {
                    console.log('error: ', error);
                    AlertActions.showPopupError('forget-password', error.message || error.toString());
                }
            }

        }

        render() {
            return (
                <div className="cloud">
                    <div className="container forgot-password">
                        <div className="title">
                            <h3>重設密碼</h3>
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
                            <button className="btn btn-cancel" onClick={() => {location.hash = '#studio/cloud/sign-in'}}>{LANG.back}</button>
                            <button className="btn btn-default" onClick={() => this.handleNextClick()}>重設密碼</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});
