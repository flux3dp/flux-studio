define([
    'react',
    'helpers/i18n',
    'jsx!widgets/Control',
    'jsx!views/cloud/check-sms-verification-code',
    'app/actions/alert-actions',
    'app/actions/film-cutter/film-cutter-cloud',
], function(
    React,
    i18n,
    Control,
    CheckSmsVerificationCode,
    AlertActions,
    FilmCutterCloud
) {
    const LANG = i18n.lang.settings.flux_cloud;

    const STEP_SIGN_UP_FORM = Symbol();
    const STEP_CHECK_SMS_VERIFAICATION_CODE = Symbol();

    return class SignUp extends React.Component {
        constructor() {
            super();
            this.state = {
                currentStep: STEP_SIGN_UP_FORM,
                // input field:
                phonePrefix: '+86',
                phoneNumber: '',
                lastName: '',
                firstName: '',
                password: '',
                rePassword: '',
                shopName: '',
                shopAddress: '',
                agreeToTerms: false,

                //error message:
                showPhoneNumberMissingError: false,
                showLastNameMissingError: false,
                showFirstNameMissingError: false,
                showPasswordMissingError: false,
                showRePasswordUnmatchError: false,
                showShopNameMissingError: false,
                showAddressMissingError: false,
                showAgreeToTermsMissingError: false,

                //is communicate with cloud
                isProcessing: false,
            };
        }

        getFullPhoneNumber() {
            return this.state.phonePrefix + this.state.phoneNumber;
        }

        handleInputChange(field, value) {
            this.setState({
                [field]: value
            });
        }

        validateForm() {
            const isPhoneNumberMissing = () => this.state.phoneNumber === '';
            const isLastNameMissing = () => this.state.lastName === '';
            const isFirstNameMissing = () => this.state.firstName === '';
            const isPasswordMissing = () => this.state.password === '';
            const isRePasswordUnmatch = () => this.state.password !== this.state.rePassword;
            const isShopNameMissing = () => this.state.shopName === '';
            const isAddressMissing = () => this.state.shopAddress === '';
            const isAgreeToTermsMissing = () => this.state.agreeToTerms === false;

            this.setState({
                showPhoneNumberMissingError: isPhoneNumberMissing(),
                showLastNameMissingError: isLastNameMissing(),
                showFirstNameMissingError: isFirstNameMissing(),
                showPasswordMissingError: isPasswordMissing(),
                showRePasswordUnmatchError: isRePasswordUnmatch(),
                showShopNameMissingError: isShopNameMissing(),
                showAddressMissingError: isAddressMissing(),
                showAgreeToTermsMissingError: isAgreeToTermsMissing()
            });

            return (
                !isPhoneNumberMissing() &&
                !isLastNameMissing() &&
                !isFirstNameMissing() &&
                !isPasswordMissing() &&
                !isRePasswordUnmatch() &&
                !isShopNameMissing() &&
                !isAddressMissing() &&
                !isAgreeToTermsMissing()
            );
        }

        async handleSignUpClick() {
            if(this.validateForm()) {
                try {
                    await FilmCutterCloud.sendSMSVerificationCode(this.getFullPhoneNumber(), 'registration');
                    this.setState({ currentStep: STEP_CHECK_SMS_VERIFAICATION_CODE });
                } catch (error) {
                    console.log('error: ', error);
                    AlertActions.showPopupError('sign-up-form', error.message || error.toString());
                }
            }
        }
        handleCancelClick() {
            location.hash = '#studio/cloud/sign-in';
        }

        async signUpToCloud(verificationCode) {
            console.log('signUpToCloud');
            try {
                await FilmCutterCloud.registration({
                    phone_number: this.getFullPhoneNumber(),
                    password: this.state.password,
                    last_name: this.state.lastName,
                    first_name: this.state.firstName,
                    shop_name: this.state.shopName,
                    shop_address: this.state.shopAddress,
                    verification_code: verificationCode
                });
                AlertActions.showPopupInfo('sign-up-form', '已成功註冊');
                location.hash = '#studio/cloud/sign-in';
            } catch (error) {
                console.log('error: ', error);
                AlertActions.showPopupError('sign-up-form', error.message || error.toString());
            }
        }

        _renderSignUpForm() {
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{LANG.sign_up}</h3>
                        </div>
                        <div className='row'>
                            <Control label={'帳號(手機號)'} errorMessage={this.state.showPhoneNumberMissingError ? '請輸入手機號' : ' '}>
                                <select
                                    value={this.state.phonePrefix}
                                    onChange={e => this.handleInputChange('phonePrefix', e.target.value)}
                                    style={{display: 'inline-block', width: '100px', height: '41px', marginLeft: '10px', backgroundPosition: 'calc(100% - 6px) center'}}
                                >
                                    <option value='+86'>+86 中國</option>
                                    {/* <option value='+852'>+852 香港</option>
                                    <option value='+853'>+853 澳門</option>
                                    <option value='+886'>+886 台灣</option> */}
                                </select>
                                <input
                                    type='text'
                                    value={this.state.phoneNumber}
                                    onChange={e => this.handleInputChange('phoneNumber', e.target.value)}
                                    onBlur={e => this.handleInputChange('phoneNumber', e.target.value)}
                                    placeholder={'手機號'}
                                    style={{display: 'inline-block', width: '190px'}}
                                />
                            </Control>
                            <Control label={'真實姓名'} errorMessage={this.state.showLastNameMissingError || this.state.showFirstNameMissingError ? '請輸入真實姓名' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.lastName}
                                    onChange={e => this.handleInputChange('lastName', e.target.value)}
                                    onBlur={e => this.handleInputChange('lastName', e.target.value)}
                                    placeholder={'姓'}
                                    style={{width: '100px'}}
                                />
                                <input
                                    type='text'
                                    value={this.state.firstName}
                                    onChange={e => this.handleInputChange('firstName', e.target.value)}
                                    onBlur={e => this.handleInputChange('firstName', e.target.value)}
                                    placeholder={'名'}
                                    style={{width: '180px'}}
                                />
                            </Control>
                        </div>

                        <div className="row">
                            <Control label={LANG.password} errorMessage={this.state.showPasswordMissingError ? '請輸入密碼' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.password}
                                    onChange={e => this.handleInputChange('password', e.target.value)}
                                    onBlur={e => this.handleInputChange('password', e.target.value)}
                                    placeholder={LANG.password}
                                />
                            </Control>
                            <Control label={'密碼確認'} errorMessage={this.state.showRePasswordUnmatchError ? '密碼不符合' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.rePassword}
                                    onChange={e => this.handleInputChange('rePassword', e.target.value)}
                                    onBlur={e => this.handleInputChange('rePassword', e.target.value)}
                                    placeholder={'密碼確認'}
                                />
                            </Control>
                        </div>

                        <div className="row">
                            <Control label={'店家名'} errorMessage={this.state.showShopNameMissingError ? '請輸入店家名' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.shopName}
                                    onChange={e => this.handleInputChange('shopName', e.target.value)}
                                    onBlur={e => this.handleInputChange('shopName', e.target.value)}
                                    placeholder={'店家名'}
                                />
                            </Control>
                            <Control label={'店家地址'} errorMessage={this.state.showAddressMissingError ? '請輸入地址' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.shopAddress}
                                    onChange={e => this.handleInputChange('shopAddress', e.target.value)}
                                    onBlur={e => this.handleInputChange('shopAddress', e.target.value)}
                                    placeholder={'店家地址'}
                                />
                            </Control>
                        </div>

                        <Control>
                            <input
                                type='checkbox'
                                className='pointer'
                                checked={this.state.agreeToTerms}
                                onChange={e => this.handleInputChange('agreeToTerms', e.target.checked)}
                            />
                            <label>
                                同意<a href="http://">用戶使用條款</a>
                            </label>
                        </Control>
                        <div className="processing-error">
                            <label>{this.state.showAgreeToTermsMissingError ? LANG.agree_to_terms : ''}</label>
                            <br/>
                        </div>
                    </div>
                    <div className="processing">
                        <label>{this.state.isProcessing ? LANG.processing : ''}</label>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => this.handleCancelClick()}>{LANG.cancel}</button>
                            <button className="btn btn-default" onClick={() => this.handleSignUpClick()}>{LANG.sign_up}</button>
                        </div>
                    </div>
                </div>
            );
        }
        _renderCheckSmsVerificationCode() {
            return (
                <CheckSmsVerificationCode
                    phoneNumber={this.getFullPhoneNumber()}
                    onNext={(code) => this.signUpToCloud(code)}
                    onBack={() => this.setState({currentStep: STEP_SIGN_UP_FORM})}
                    reason={'registration'}
                />);
        }
        render() {
            if (this.state.currentStep === STEP_SIGN_UP_FORM) {
                return this._renderSignUpForm();
            } else if (this.state.currentStep === STEP_CHECK_SMS_VERIFAICATION_CODE) {
                return this._renderCheckSmsVerificationCode();
            }
        }
    };

});
