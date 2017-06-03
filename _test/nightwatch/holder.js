module.exports = {
	'Holder Test' : function (browser) {
		const svgFile = require('path').resolve(__dirname + '/../example_files/6-pointed-star.svg');
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

			// navigate to laser
			.execute(function() {window.location = '#studio/draw'; })
			.pause(1000)

			// load (calibration) test image
			.setValue('input[type=file]', svgFile) // Load PNG

			// send to nightwatch-laser
			.click('.btn-go')
			.waitForElementVisible('#nightwatch-laser', 20000)
			.click('#nightwatch-laser')
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

			// wait for dashboard ready
			.waitForElementVisible('div.flux-monitor', 30000)

			// check for shading time
			.assert.containsText('.status-info-duration', '16 s')
			.click('.close')

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
