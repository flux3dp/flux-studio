define([
    'react',
    'helpers/i18n',
    'helpers/sprintf',
    'helpers/api/cloud',
    'plugins/classnames/index',
    'helpers/nwjs/menu-factory',
], function(
    React,
    i18n,
    Sprintf,
    CloudApi,
    ClassNames,
    menuFactory
) {
    const LANG = i18n.lang.settings.flux_cloud;
    return React.createClass({

        getInitialState: function() {
            return {
                phonePrefix: '+86',
                phoneNumber: '',
                password: '',
                processing: false,
            };
        },

        componentDidMount: async function() {
            const response = await CloudApi.getMe();
            if(response.ok) {
                const responseBody = response.json();
                if(responseBody) {
                    location.hash = '#/studio/cloud/bind-machine';
                }
            }
        },

        _handlePasswordChange: function(e) {
            this.setState({
                password: e.target.value
            });
        },

        _handlePhonePrefixChange: function(e) {
            this.setState({
                phonePrefix: e.target.value
            });
        },

        _handlePhoneNumberChange: function(e) {
            this.setState({
                phoneNumber: e.target.value
            });
        },

        _handleDetectEnterKey: function(e) {
            if(e.key === 'Enter') {
                this._handleSignIn(e);
            }
        },

        _handleCancel: function() {
            location.hash = '#/studio/beambox';
        },

        _handleSignIn: async function(e) {
            e.preventDefault();
            const { phonePrefix, phoneNumber, password } = this.state;
            const phone = phonePrefix + phoneNumber;
            this.setState({
                errorMessage: '',
                processing: true
            });

            const response = await CloudApi.signIn(phone, password);
            const responseBody = await response.json();
            if(response.ok) {
                const { nickname } = responseBody;
                const displayName = nickname || phone;
                menuFactory.methods.updateAccountDisplay(displayName);
                location.hash = '#/studio/cloud/bind-machine';
            } else {
                this.setState({
                    errorMessage: LANG[responseBody.message.toLowerCase()] || LANG.SERVER_INTERNAL_ERROR,
                    processing: false
                });
                return;
            }
        },

        render: function() {
            const message = (this.state.processing) ? LANG.processing : '';

            return(
                <div className='cloud'>
                    <div className='container'>
                        <div className='title'>
                            <h3>{LANG.sign_in}</h3>
                            <h2>{LANG.flux_cloud}</h2>
                        </div>
                        <div className='controls'>
                            <div>
                                <select
                                    style={{
                                        display: 'inline-block',
                                        width: '100px',
                                        height: '41px',
                                        marginLeft: '10px',
                                        backgroundPosition: 'calc(100% - 6px) center'
                                    }}
                                    value={this.state.phonePrefix}
                                    onChange={this._handlePhonePrefixChange}
                                >
                                    <option value='+86'>+86 中國</option>
                                    <option value='+852'>+852 香港</option>
                                    <option value='+853'>+853 澳門</option>
                                    <option value='+886'>+886 台灣</option>
                                </select>
                                <input
                                    value={this.state.phoneNumber}
                                    onChange={this._handlePhoneNumberChange}
                                    type='text'
                                    placeholder={LANG.phone}
                                    style={{display: 'inline-block', width: '190px'}} />
                            </div>
                            <div>
                                <input
                                    value={this.state.password}
                                    onChange={this._handlePasswordChange}
                                    type='password'
                                    placeholder='Password'
                                    onKeyPress={this._handleDetectEnterKey} />
                            </div>
                            <div className='forget-password'>
                                <a href='#/studio/cloud/forgot-password'>{LANG.forgot_password}</a>
                            </div>
                            <div className='sign-up-description' dangerouslySetInnerHTML={
                                {__html: Sprintf(LANG.sign_up_statement, '#/studio/cloud/sign-up')}
                            } />
                        </div>
                        <div className='processing-error'>
                            <label>{this.state.errorMessage}</label><br/>
                        </div>
                    </div>
                    <div className='processing'>
                        <label>{message}</label>
                    </div>
                    <div className='footer'>
                        <div className='divider'>
                            <hr />
                        </div>
                        <div className='actions'>
                            <button className='btn btn-cancel' onClick={this._handleCancel}>{LANG.back}</button>
                            <button className='btn btn-default' onClick={this._handleSignIn}>{LANG.sign_in}</button>
                        </div>
                    </div>
                </div>
            );
        }

    });

});
