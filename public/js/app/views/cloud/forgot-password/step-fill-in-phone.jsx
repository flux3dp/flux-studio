define([
    'react',
    'helpers/i18n',
    'helpers/seperate-phone-number',
    'app/actions/alert-actions',
    'app/actions/film-cutter/record-manager',
    'app/actions/film-cutter/film-cutter-cloud',
], function(
    React,
    i18n,
    SeperatePhoneNumber,
    AlertActions,
    RecordManager,
    FilmCutterCloud
) {
    const LANG = i18n.lang.settings.flux_cloud;

    return class StepFillInPhone extends React.Component {
        constructor(props) {
            super(props);
            const {prefix, number} = SeperatePhoneNumber(this.props.phone || RecordManager.read('account'));
            this.state = {
                phonePrefix: prefix || '+86',
                phoneNumber: number || '',
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
            const phone = `${this.state.phonePrefix}${this.state.phoneNumber}`;
            if(this.state.phoneNumber) {
                try {
                    await FilmCutterCloud.sendSMSVerificationCode(phone, 'forget-password');
                    this.props.setPhone(phone);
                    this.props.gotoNextStep();
                } catch (error) {
                    console.log('error: ', error);
                    AlertActions.showPopupError('forget-password', error.message || error.toString());
                }
            }
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
                                        {/* <option value='+852'>+852 香港</option>
                                        <option value='+853'>+853 澳門</option>
                                        <option value='+886'>+886 台灣</option> */}
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
