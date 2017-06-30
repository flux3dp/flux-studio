module.exports = {
	'Laser Test' : function (browser) {
		const pngFile = require('path').resolve(__dirname + '/../example_files/star.png');
		const svgFile = require('path').resolve(__dirname + '/../example_files/star.svg');
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
			.execute(function() {window.location = '#studio/laser'; })

			// load (calibration) test image
			.waitForElementVisible('button[data-ga-event=yes]', 8000)
			.click('[data-test-key="no"]')
			.setValue('input[type=file]', pngFile) // Load PNG

			// send to nightwatch-laser
			.click('[data-ga-event="laser-goto-monitor"]')
			.waitForElementVisible('#nightwatch-laser', 5000)
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
			.assert.containsText('.status-info-duration', '46 m 2 s')
			.click('.close')

			// turn off shading
			.click('.shading')

			// send to nightwatch-laser
			.click('[data-ga-event="laser-goto-monitor"]')
			.waitForElementVisible('#nightwatch-laser', 5000)
			.click('#nightwatch-laser')

			// wait for dashboard ready
			.waitForElementVisible('div.flux-monitor', 30000)

			// check for shading time
			.assert.containsText('.status-info-duration', '46 m 2 s')
			.click('.close')

			// delete image
			.click('.ft-controls')
			.keys(browser.Keys.BACK_SPACE)

			// load SVG file
			.setValue('input[type=file]', svgFile) // Load PNG

			// send to nightwatch-laser
			.click('[data-ga-event="laser-goto-monitor"]')
			.waitForElementVisible('#nightwatch-laser', 5000)
			.click('#nightwatch-laser')

			// wait for dashboard ready
			.waitForElementVisible('div.flux-monitor', 30000)

			// check for svg time
			.assert.containsText('.status-info-duration', '13 s')
			.click('.close')

			// test code end -----------

			.keys(browser.Keys.CONTROL)
			.keys('q')
			.end();
	}
	// TODO: Test switch slicing engine to slic3r, cura, cura2
	// TODO: Test if raft, support is working
	// TODO: Test if save test is working
};
