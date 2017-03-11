module.exports = {
  'Printing UI Testing' : function (browser) {
    const filePath = require('path').resolve(__dirname + '/../example_files/guide-example.stl');
    browser.waitForElementVisible('body', 6000)
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
      .waitForElementNotPresent('div.modal-alert .spinner-roller', 30000) // Wait slicing service loaded
      .waitForElementVisible('button[data-ga-event=yes]', 8000)
      .click('button[data-ga-event=yes]') /// Say will send usage info
      .setValue('.arrowBox input[type=file]', filePath) // Load STL
      .waitForElementNotPresent('button.btn-disabled[data-ga-event=print-goto-monitor]', 30000)
      .click('button[data-ga-event=print-goto-monitor]') // Click GO
      .pause(500)
      .waitForElementVisible('div.printer-item[data-status=st0]', 5000)
      .click('div.printer-item[data-status=st0]') // Select Idle printer
      .waitForElementVisible('div.modal-alert', 5000)
      .waitForElementVisible('.modal-alert input', 30000)
      .setValue('.modal-alert input', 'flux')
      .click('button[data-ga-event=confirm]') // Input default password
      .waitForElementVisible('div.flux-monitor', 30000) // Display dashboard
      .waitForElementVisible('.operation .controls.center .description', 10000) // Get start button
      .assert.containsText('.operation .controls.center .description', 'Start')
      .end();
  }
};
