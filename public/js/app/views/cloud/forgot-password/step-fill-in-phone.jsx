define([
    'react',
    'helpers/i18n',
    'helpers/api/cloud'
], function(
    React,
    i18n,
    CloudApi
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return class StepFillInPhone extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                phonePrefix: '+86',
                phoneNumber: '',
            };
        }

        handlePhonePrefixChange(val) {
            this.setState({ phonePrefix: val });
        }

        handlePhoneNumberChange(val) {
            this.setState({ phoneNumber: val });
        }

        handleBack() {
            location.hash = '#studio/cloud/sign-in';
        }

        async handleSendSMSClick() {
            if (this.state.phoneNumber === '') {
                return;
            }
            const phone = this.state.phonePrefix + this.state.phoneNumber;
            this.props.setPhone(phone);
            this.props.goToNextStep();
            // const response = await CloudApi.resetPassword(phone);
            // if(response.ok) {
            //     location.hash = '#studio/cloud/email-sent';
            // } else {
            //     alert(LANG.contact_us);
            // }
        }

        render() {
            return(
                <div className="cloud">
                    <div className="container forgot-password">
                        <div className="middle">
                            <div className="description">
                                <h3>請輸入您的手機號</h3>
                            </div>
                            <div className="controls">
                                <div className="control">
                                    <select
                                        value={this.state.phonePrefix}
                                        onChange={e => this.handlePhonePrefixChange(e.target.value)}
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
                                        onChange={e => this.handlePhoneNumberChange(e.target.value)}
                                        onBlur={e => this.handlePhoneNumberChange(e.target.value)}
                                        placeholder={'手機號'}
                                        style={{display: 'inline-block', width: '190px'}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => this.handleBack()}>{LANG.back}</button>
                            <button className="btn btn-default" onClick={() => this.handleSendSMSClick()}>發送驗證碼</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});
