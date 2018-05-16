define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud',
], function(
    React,
    i18n,
    CloudApi
) {
    const LANG = i18n.lang.settings.flux_cloud;

    const Controls = ({label, children, errorMessage}) => {
        const labelField = label ? <div className="label">{label}</div> : '';
        const errorField = errorMessage ? <div className="error">{errorMessage}</div> : '';
        return (
            <div className="controls">
                {labelField}
                <div className="control">{children}</div>
                {errorField}
            </div>
        );
    };

    return class SignUp extends React.Component {
        constructor() {
            super();
            this.state = {
                // input field:
                phonePrefix: '+86',
                phoneNumber: '',
                realName: '',
                password: '',
                rePassword: '',
                shopName: '',
                address: '',
                agreeToTerms: false,

                //error message:
                showPhoneNumberMissingError: false,
                showRealNameMissingError: false,
                showPasswordMissingError: false,
                showRePasswordUnmatchError: false,
                showShopNameMissingError: false,
                showAddressMissingError: false,
                showAgreeToTermsMissingError: false,

                //is communicate with cloud
                isProcessing: false,
            };
        }

        handleInputChange(field, value) {
            this.setState({
                [field]: value
            });
        }

        checkValidation() {
            const isPhoneNumberMissing = () => this.state.phoneNumber === '';
            const isRealNameMissing = () => this.state.realName === '';
            const isPasswordMissing = () => this.state.password === '';
            const isRePasswordUnmatch = () => this.state.password !== this.state.rePassword;
            const isShopNameMissing = () => this.state.shopName === '';
            const isAddressMissing = () => this.state.address === '';
            const isAgreeToTermsMissing = () => this.state.agreeToTerms === false;

            this.setState({
                showPhoneNumberMissingError: isPhoneNumberMissing(),
                showRealNameMissingError: isRealNameMissing(),
                showPasswordMissingError: isPasswordMissing(),
                showRePasswordUnmatchError: isRePasswordUnmatch(),
                showShopNameMissingError: isShopNameMissing(),
                showAddressMissingError: isAddressMissing(),
                showAgreeToTermsMissingError: isAgreeToTermsMissing()
            });

            return (
                !isPhoneNumberMissing() &&
                !isRealNameMissing() &&
                !isPasswordMissing() &&
                !isRePasswordUnmatch() &&
                !isShopNameMissing() &&
                !isAddressMissing() &&
                !isAgreeToTermsMissing()
            );
        }

        async handleSignUpClick() {
            if(this.checkValidation()) {
                this.setState({ isProcessing: true });
                const {phonePrefix, phoneNumber, realName, password, shopName, address} = this.state;
                // const response = await CloudApi.signUp(fullName, email, password);
                // if(response.ok) {
                //     this.setState({ processing: false });
                //     alert(LANG.check_email);
                location.hash = '#studio/cloud/sign-up-captcha';
                // } else {
                //     const error = await response.json();
                //     this.setState({
                //         processing: false,
                //         emailError: true,
                //         emailErrorMessage: LANG[error.message.toLowerCase()]
                //     });
                // }
            }
        }

        handleCancelClick() {
            location.hash = '#studio/cloud/sign-in';
        }

        render() {
            return(
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{LANG.sign_up}</h3>
                            <h2>{LANG.flux_cloud}</h2>
                        </div>
                        <div className='row'>
                            <Controls label={'帳號(手機號)'} errorMessage={this.state.showPhoneNumberMissingError ? '請輸入手機號' : ' '}>
                                <select
                                    value={this.state.phonePrefix}
                                    onChange={e => this.handleInputChange('phonePrefix', e.target.value)}
                                    style={{display: 'inline-block', width: '100px', height: '41px', marginLeft: '10px', backgroundPosition: 'calc(100% - 6px) center'}}
                                >
                                    <option value='+86'>+86 中國</option>
                                    <option value='+852'>+852 香港</option>
                                    <option value='+853'>+853 澳門</option>
                                    <option value='+886'>+886 台灣</option>
                                </select>
                                <input
                                    type='text'
                                    value={this.state.phoneNumber}
                                    onChange={e => this.handleInputChange('phoneNumber', e.target.value)}
                                    onBlur={e => this.handleInputChange('phoneNumber', e.target.value)}
                                    placeholder={'手機號'}
                                    style={{display: 'inline-block', width: '190px'}}
                                />
                            </Controls>
                            <Controls label={'真實姓名'} errorMessage={this.state.showRealNameMissingError ? '請輸入真實姓名' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.realName}
                                    onChange={e => this.handleInputChange('realName', e.target.value)}
                                    onBlur={e => this.handleInputChange('realName', e.target.value)}
                                    placeholder={'真實姓名'}
                                />
                            </Controls>
                        </div>

                        <div className="row">
                            <Controls label={LANG.password} errorMessage={this.state.showPasswordMissingError ? '請輸入密碼' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.password}
                                    onChange={e => this.handleInputChange('password', e.target.value)}
                                    onBlur={e => this.handleInputChange('password', e.target.value)}
                                    placeholder={LANG.password}
                                />
                            </Controls>
                            <Controls label={LANG.rePassword} errorMessage={this.state.showRePasswordUnmatchError ? '密碼不符合' : ' '}>
                                <input
                                    type='password'
                                    value={this.state.rePassword}
                                    onChange={e => this.handleInputChange('rePassword', e.target.value)}
                                    onBlur={e => this.handleInputChange('rePassword', e.target.value)}
                                    placeholder={LANG.rePassword}
                                />
                            </Controls>
                        </div>

                        <div className="row">
                            <Controls label={'店家名'} errorMessage={this.state.showShopNameMissingError ? '請輸入店家名' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.shopName}
                                    onChange={e => this.handleInputChange('shopName', e.target.value)}
                                    onBlur={e => this.handleInputChange('shopName', e.target.value)}
                                    placeholder={'店家名'}
                                />
                            </Controls>
                            <Controls label={'地址'} errorMessage={this.state.showAddressMissingError ? '請輸入地址' : ' '}>
                                <input
                                    type='text'
                                    value={this.state.address}
                                    onChange={e => this.handleInputChange('address', e.target.value)}
                                    onBlur={e => this.handleInputChange('address', e.target.value)}
                                    placeholder={'地址'}
                                />
                            </Controls>
                        </div>

                        <Controls>
                            <input
                                type='checkbox'
                                className='pointer'
                                checked={this.state.agreeToTerms}
                                onChange={e => this.handleInputChange('agreeToTerms', e.target.checked)}
                            />
                            <label>
                                同意<a href="http://">用戶使用條款</a>
                            </label>
                        </Controls>
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
    };
});
