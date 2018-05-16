define([
    'react',
    'helpers/api/cloud',
    'jsx!views/cloud/forgot-password/step-change-password',
    'jsx!views/cloud/forgot-password/step-fill-in-phone',
], function(
    React,
    CloudApi,
    StepChangePassword,
    StepFillInPhone
) {
    const STEP_FILL_IN_PHONE = Symbol();
    const STEP_CHANGE_PASSWORD = Symbol();

    return class ForgotPassword extends React.Component {
        constructor() {
            super();
            this.state = {
                curStep: STEP_CHANGE_PASSWORD,
                phone: '',
            };
        }
        changeCurStep(nextStep) {
            this.setState({
                curStep: nextStep
            });
        }
        setPhone(phone) {
            this.setState({phone: phone});
        }
        render() {
            switch (this.state.curStep) {
                case STEP_FILL_IN_PHONE:
                    return <StepFillInPhone goToNextStep={() => this.changeCurStep(STEP_CHANGE_PASSWORD)} setPhone={(phone) => this.setPhone(phone)} />;
                case STEP_CHANGE_PASSWORD:
                    return <StepChangePassword phone={this.state.phone} />;
            }
        }
    };

});
