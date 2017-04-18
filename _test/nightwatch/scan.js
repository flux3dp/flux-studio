var fs = require('fs'),
		resemble = require('node-resemble-js');

module.exports = {
	'Scan Test' : function (browser) {
		browser
			// required for passing all the setup
			.waitForElementVisible('body', 6000)
			.waitForElementVisible('div.modal-alert', 10000)
			.waitForElementVisible('button.btn.btn-default', 8000)
			.click('button.btn.btn-default') // Warning popout from not running from Application folder
			.waitForElementVisible('a.btn.btn-action.btn-large', 500)
			.click('a.btn.btn-action.btn-large') // Next
			.waitForElementVisible('a[data-ga-event=skip]', 500)
			.click('a[data-ga-event=skip]') // Skip setting
			.waitForElementVisible('button[data-ga-event=start]', 500)
			.click('button[data-ga-event=start]') // Start creating
			.waitForElementVisible('div.modal-alert', 8000)
			.waitForElementNotPresent('div.modal-alert .spinner-roller', 8000) // Wait slicing service loaded
			.click('button[data-ga-event=yes]')

			// test code start -----------
			.execute(function() {
				// ???
			}, [], (result) => {
				let path = __dirname + '/../scan.png';
				console.log('--- check ---', path);
				try {
					fs.readFile(path, function(err, data) {
						console.log(err, data);
						resemble(data).onComplete((d1) => {
							console.log(d1);
						});
					});
				}
				catch(ex) {
					console.log(ex);
				}
			})
			.pause(500 * 1000)
/*
			// navigate to scan
			.execute(function() {window.location = '#studio/scan'; })
			.pause(1000)

			// select nightwatch-scan & authenticate
			.waitForElementVisible('#nightwatch-scan', 30 * 1000)
			.click('#nightwatch-scan')
			.waitForElementVisible('div.modal-alert', 5000, false, function(result){
					// Input password if needed
					if (result.value) {
							browser.waitForElementVisible('.modal-alert input', 30000)
							.setValue('.modal-alert input', 'flux')
							.click('button[data-ga-event=confirm]'); // Input default password
					} else {
							// No password needed
					}
			})
			.waitForElementNotPresent('div.modal-alert', 10 * 1000)

			// select draft quality
			.click('.ui-dialog-menu-item')
			.pause(1 * 1000)
			.waitForElementVisible('.resolution-draft', 3000)
			.click('.resolution-draft')

			// execute scan
			.click('.go')

			// wait for scan finish
			// .waitForElementVisible('.btn-scan-again', 5 * 60 * 1000)

			.pause(5000)
			.click('.btn-stop-scan')
			.pause(1000)

			// save screenshot
			.keys(browser.Keys.CONTROL)
			.keys('e')
			.pause(2 * 1000)
*/
			// test code end -----------
			// clean up
			.keys(browser.Keys.CONTROL)
			.keys('q')
			.end();
	}
	// TODO: Test switch slicing engine to slic3r, cura, cura2
	// TODO: Test if raft, support is working
	// TODO: Test if save test is working
};
