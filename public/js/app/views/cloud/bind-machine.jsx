define([
	'jquery',
	'react',
	'helpers/i18n',
	'helpers/device-master',
	'helpers/device-list',
	'helpers/pad-string',
	'plugins/classnames/index',
	'helpers/api/cloud',
	'app/actions/alert-actions',
	'helpers/firmware-version-checker'
], function(
	$,
	React,
	i18n,
	DeviceMaster,
	DeviceList,
	PadString,
	ClassNames,
	CloudApi,
	AlertActions,
	FirmwareVersionChecker
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
			FirmwareVersionChecker.check(device, 'CLOUD').then((allowCloud) => {
				if(allowCloud) {
					this.setState({
						meetVersionRequirement: allowCloud,
						selectedDevice: device
					});
				}
				else {
					let lang = this.props.lang.settings.flux_cloud;

					AlertActions.showPopupError(
						'error-vcredist',
						lang.not_supported_firmware
					);
				}
			});
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
					const waitForDevice = (deferred) => {
						deferred = deferred || $.Deferred();

						DeviceMaster.getDeviceInfo().then(response => {
							let result = response.cloud[1].join('_');

							if(response.cloud[0] === false && result === 'DISABLE') {
								setTimeout(() => {
									waitForDevice(deferred);
								}, 2 * 1000);
							}
							else {
								let error = response.cloud[1];
								error.unshift('CLOUD');
								this.props.onError(error);
							}
						});

						return deferred.promise();
					};

					DeviceMaster.getDeviceInfo().then(response => {
						let tried = 0;

						const bindDevice = (uuid, token, accessId, signature) => {
							CloudApi.bindDevice(uuid, token, accessId, signature).then(r => {
								if(r.ok) {
									this.setState({ bindingInProgress: false });
									location.hash = '#/studio/cloud/bind-success';
								}
								else {
									if(tried > 2) {
										location.hash = '#/studio/cloud/bind-fail';
									}
									else {
										tried++;
										// try another time
										setTimeout(() => {
											bindDevice(uuid, token, accessId, signature);
										}, 2 * 1000);
									}
								}
							});
						};

						const processEnableCloudResult = (cloudResult) => {
							if(typeof cloudResult === 'undefined') {
								return new Promise(r => r.resolve());
							}

							if(cloudResult.status === 'ok') {
								waitForDevice().then(() => {
									getCloudValidationCodeAndBind();
								}).fail((error) => {
									this.props.onError(error);
								});
							}
							else {
								location.hash = '#/studio/cloud/bind-fail';
							}
						};

						const getCloudValidationCodeAndBind = () => {
							DeviceMaster.getCloudValidationCode().then(r => {
								let { token, signature } = r.code,
									{ uuid } = this.state.selectedDevice,
									accessId = r.code.access_id;

								signature = encodeURIComponent(signature);
								bindDevice(uuid, token, accessId, signature);
							});
						};

						if(response.cloud[0] === true) {
							getCloudValidationCodeAndBind();
						}
						else {
							if(response.cloud[1].join('') === 'DISABLE') {
								DeviceMaster.enableCloud().then(processEnableCloudResult);
							}
							else {
								let error = response.cloud[1];
								error.unshift('CLOUD');
								this.props.onError(error);
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
