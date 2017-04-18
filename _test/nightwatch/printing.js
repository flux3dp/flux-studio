module.exports = {
  'Printing Basic Testing' : function (browser) {
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
      .waitForElementVisible('div.printer-item[data-status=st0]', 20000)
      .click('div.printer-item[data-status=st0]') // Select Idle printer
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
      .waitForElementVisible('div.flux-monitor', 30000) // Display dashboard
      .waitForElementVisible('.operation .controls.center .description', 10000) // Get start button
      .assert.containsText('.operation .controls.center .description', 'Start')
      .click('.operation .controls.center')
      .waitForElementNotPresent('.operation .controls.left.disabled', 300000) // Wait til we can abort
      .click('.operation .controls.left') // Abort
      .end();
  }
  // TODO: Test switch slicing engine to slic3r, cura, cura2
  // TODO: Test if raft, support is working
  // TODO: Test if save test is working
};
