define([
    'react',
    'jsx!widgets/Control',
    'app/actions/alert-actions',
    'app/actions/film-cutter/film-cutter-cloud'
], function(
    React,
    Control,
    AlertActions,
    FilmCutterCloud
) {
    return class CheckSMSVerificationCode extends React.Component {
        constructor() {
            super();
            this.state = {
                code: ''
            };
        }
        async handleNextClick() {
            try {
                await FilmCutterCloud.checkVerificationCode(this.props.phoneNumber, this.props.reason, this.state.code);
                this.props.onNext(this.state.code);
            } catch (error) {
                AlertActions.showPopupError('sms-verification-code', '驗證失敗');
            }
        }
        render() {
            return (
                <div className="cloud">
                    <div className="container">
                        <div className="title">
                            <h3>{'安全性驗證'}</h3>
                        </div>
                        <Control>
                            <input
                                type='text'
                                value={this.state.code}
                                onChange={e => this.setState({code: e.target.value})}
                                onBlur={e => this.setState({code: e.target.value})}
                                placeholder={'手機驗證碼'}
                            />
                        </Control>
                    </div>
                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={() => this.props.onBack()}>{'上一步'}</button>
                            <button className="btn btn-default" onClick={() => this.handleNextClick()}>{'下一步'}</button>
                        </div>
                    </div>
                </div>
            );
        }
    };
});

