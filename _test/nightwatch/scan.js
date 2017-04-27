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
			.pause(1 * 1000)

			// execute scan
			.click('.go')

			// wait for scan finish
			.waitForElementVisible('.btn-scan-again', 5 * 60 * 1000)

			// .pause(5 * 1000)
			// .click('.btn-stop-scan')
			// .pause(1 * 1000)

			// save screenshot
			.keys(browser.Keys.CONTROL)
			.keys('e')
			.pause(2 * 1000)

			// compare images
			.execute(function() {
				// ???
			}, [], () => {
				let ref = __dirname + '/../scan.png',
					img = __dirname + '/../tests_output/mypreview.png';

				try {
					fs.readFile(ref, function(err, d1) {
						fs.readFile(img, function(err, d2) {
							resemble(d1)
							.compareTo(d2)
							.ignoreColors()
							.onComplete((result) => {
								console.log(result);
								fs.unlink(img, () => {});
							});
						});
					});
				}
				catch(ex) {
					console.log(ex);
				}
			})
			.pause(500 * 1000)

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
