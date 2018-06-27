define([
    'react',
    'jsx!views/cloud/forgot-password/step-change-password',
    'jsx!views/cloud/forgot-password/step-fill-in-phone',
    'jsx!views/cloud/check-sms-verification-code',
], function(
    React,
    StepChangePassword,
    StepFillInPhone,
    CheckSmsVerificationCode
) {
    const STEP_FILL_IN_PHONE = Symbol();
    const STEP_CHECK_SMS_VERIFICATION_CODE = Symbol();
    const STEP_CHANGE_PASSWORD = Symbol();

    return class ForgotPassword extends React.Component {
        constructor() {
            super();
            this.state = {
                curStep: STEP_FILL_IN_PHONE,
                phone: '',
                verificationCode: ''
            };
        }
        changeCurStep(nextStep) {
            this.setState({
                curStep: nextStep
            });
        }
        setPhone(phone) {
            this.setState({phone});
        }
        setVerificationCode(code) {
            this.setState({verificationCode: code});
        }
        render() {
            switch (this.state.curStep) {
                case STEP_FILL_IN_PHONE:
                    return (
                        <StepFillInPhone
                            gotoNextStep={() => this.changeCurStep(STEP_CHECK_SMS_VERIFICATION_CODE)}
                            setPhone={(phone) => this.setPhone(phone)}
                            phone={this.state.phone}
                        />
                    );
                case STEP_CHECK_SMS_VERIFICATION_CODE:
                    return (
                        <CheckSmsVerificationCode
                            phoneNumber={this.state.phone}
                            reason='forget-password'
                            onNext={(code) => {
                                this.setVerificationCode(code);
                                this.changeCurStep(STEP_CHANGE_PASSWORD);
                            }}
                            onBack={() => this.changeCurStep(STEP_FILL_IN_PHONE)}
                        />
                    );
                case STEP_CHANGE_PASSWORD:
                    return (
                        <StepChangePassword
                            phone={this.state.phone}
                            code={this.state.verificationCode}
                        />
                    );
            }
        }
    };

});
