define([
	'jquery',
	'react',
	'helpers/i18n',
	'helpers/device-master',
	'helpers/device-list',
	'helpers/pad-string',
	'plugins/classnames/index',
	'helpers/api/cloud',
	'app/actions/alert-actions'
], function(
	$,
	React,
	i18n,
	DeviceMaster,
	DeviceList,
	PadString,
	ClassNames,
	CloudApi,
	AlertActions
) {
	'use strict';

	return React.createClass({

		lang: {},

		getInitialState: function() {
			return {
				selectedDevice: {},
				bindingInProgress: false,
				me: {}
			};
		},

		componentWillMount: function() {
			this.lang = i18n.get();
		},

		componentDidMount: function() {
			let getList = () => {
				let deviceList = DeviceList(DeviceMaster.getDeviceList());
				this.setState({ deviceList });
			};

			getList();

			setInterval(() => {
				getList();
			}, 2000);

			CloudApi.getMe().then(response => {
				if(response.ok) {
					response.json().then(content => {
						this.setState({ me: content });
						if(content.needPasswordReset) {
							location.hash = '#/studio/cloud/change-password';
						}
					});
				}
			});
		},

		_handleSignout: function() {
			CloudApi.signOut().then(() => {
				location.hash = '#studio/cloud/sign-in';
			});
		},

		_handleSelectDevice: function(device) {
			const cloudRequiredVersion = '1.5';
			const meetVersionRequirement = (installed) => {
				let a = installed.split('.');
				let b = cloudRequiredVersion.split('.');

				for (let i = 0; i < a.length; ++i) {
					a[i] = Number(a[i]);
				}
				for (let i = 0; i < b.length; ++i) {
					b[i] = Number(b[i]);
				}
				if (a.length === 2) {
					a[2] = 0;
				}

				if (a[0] > b[0]) { return true; }
				if (a[0] < b[0]) { return false; }

				if (a[1] > b[1]) { return true; }
				if (a[1] < b[1]) { return false; }

				if (a[2] > b[2]) { return true; }
				if (a[2] < b[2]) { return false; }

				return true;
			};

			let version = device.version,
				vRegex = /([\d.]+)(a|b)?(\d)?/g,
				match = vRegex.exec(version),
				lang = this.props.lang.settings.flux_cloud;

			if(match.length > 2) {
				let meetRequirement = meetVersionRequirement(match[1]);
				this.setState({ meetVersionRequirement: meetRequirement });
				if(!meetRequirement) {
					AlertActions.showPopupError(
						'error-vcredist',
						lang.not_supported_firmware
					);
				}
			}
			this.setState({ selectedDevice: device});
		},

		_handleCancel: function() {
			location.hash = '#/studio/print';
		},

		_handleCancelBinding: function() {
			this.setState({ bindingInProgress: false });
		},

		_handleBind: function() {
			this.setState({ bindingInProgress: true });
			DeviceMaster.selectDevice(this.state.selectedDevice).then((status) => {
				if(status === 'TIMEOUT') {
					location.hash = '#/studio/cloud/bind-fail';
				}
				else {
					DeviceMaster.getDeviceInfo().then(response => {

						const bindDevice = (uuid, token, accessId, signature) => {
							CloudApi.bindDevice(uuid, token, accessId, signature).then(r => {
								if(r.ok) {
									this.setState({ bindingInProgress: false });
									location.hash = '#/studio/cloud/bind-success';
								}
								else {
									location.hash = '#/studio/cloud/bind-fail';
								}
							});
						};

						const processEnableCloudResult = (cloudResult) => {
							if(typeof cloudResult === 'undefined') {
								return new Promise(r => r.resolve());
							}
							if(cloudResult.status === 'ok') {
								DeviceMaster.getCloudValidationCode().then(r => {
									let { token, signature } = r.code,
										{ uuid } = this.state.selectedDevice,
										accessId = r.code.access_id;

									signature = encodeURIComponent(signature);
									bindDevice(uuid, token, accessId, signature);
								});
							} else {
								location.hash = '#/studio/cloud/bind-fail';
							}
						};

						const processBindError = () => {
							location.hash = `#/studio/cloud/bind-error/${this.state.selectedDevice.uuid}`;
						};

						if(!Boolean(response.cloud)) {
							processBindError();
						}
						else if(response.cloud[0] === true) {
							DeviceMaster.enableCloud().then(processEnableCloudResult);
						}
						else if(!response.cloud[0]) {
							let reason = response.cloud[1].split(',');
							if(reason[0] === 'DISABLE') {
								DeviceMaster.enableCloud().then(processEnableCloudResult);
							}
							else if(response.cloud[1] === 'UNKNOWN_ERROR') {
								processBindError();
							}
							else {
								location.hash = '#/studio/cloud/bind-fail';
							}
						}
					});
				}
			});
		},

		_handleUnbind: function(uuid) {
			let lang = this.props.lang.settings.flux_cloud;

			const removeDevice = (uuid) => {
				let me = this.state.me;
				delete me.devices[uuid];
				this.setState({ me });
			};

			if(confirm(lang.unbind_device)) {
				CloudApi.unbindDevice(uuid).then(r => {
					if(r.ok) {
						removeDevice(uuid);
					}
				});
			}
		},

		_renderBindingWindow: function() {
			let lang = this.props.lang.settings.flux_cloud,
				bindingWindow;

			bindingWindow = (
				<div className="binding-window">
					<h1>{lang.binding}</h1>
					<div className="spinner-roller absolute-center"></div>
					<div className="footer">
						<a onClick={this._handleCancelBinding}>{lang.cancel}</a>
					</div>
				</div>
			);

			return this.state.bindingInProgress ? bindingWindow : '';
		},

		_renderBlind: function() {
			let blind = (
				<div className="blind"></div>
			);

			return this.state.bindingInProgress ? blind : '';
		},

		render: function() {
			let lang = this.props.lang.settings.flux_cloud,
				deviceList,
				bindingWindow,
				blind;

			bindingWindow = this._renderBindingWindow();
			blind = this._renderBlind();

			if(!this.state.deviceList) {
				deviceList = <div>{this.lang.device.please_wait}</div>;
			}
			else {
				deviceList = this.state.deviceList.map((d) => {
					let { me } = this.state,
						rowClass, linkedClass;

					rowClass = ClassNames(
						'device',
						{'selected': this.state.selectedDevice.name === d.name}
					);

					linkedClass = ClassNames({
						'linked': Object.keys(me.devices || {}).indexOf(d.uuid) !== -1
					});

					return (
						<div className={rowClass} onClick={this._handleSelectDevice.bind(null, d)}>
							<div className="name">{d.name}</div>
							<div className="status">{this.lang.machine_status[d.st_id]}</div>
							<div className={linkedClass} onClick={this._handleUnbind.bind(null, d.uuid)}></div>
						</div>
					);
				});
			}

			return(
				<div className="cloud">
					<div className="container bind-machine">
						<div className="title">
							<h3>{lang.select_to_bind}</h3>
						</div>
						<div className="controls">
							<div className="select">
								{deviceList}
								{/* <select size="8">
									{deviceList}
								</select> */}
							</div>
							<div className="user-info">
								<div className="name">{this.state.me.nickname}</div>
								<div className="email">{this.state.me.email}</div>
								<div className="change-password-link">
									<a href="#/studio/cloud/change-password">{lang.change_password}</a> / <a href="#/studio/cloud/bind-machine" onClick={this._handleSignout}>{lang.sign_out}</a>
								</div>
							</div>
						</div>
					</div>
					<div className="footer">
						<div className="divider">
							<hr />
						</div>
						<div className="actions">
							<button className="btn btn-cancel" onClick={this._handleCancel}>{lang.back}</button>
							<button className="btn btn-default" disabled={!this.state.meetVersionRequirement} onClick={this._handleBind}>{lang.bind}</button>
						</div>
					</div>
					{bindingWindow}
					{blind}
				</div>
			);
		}

	});

});
