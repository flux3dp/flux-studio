module.exports = {
  'Printing Basic Testing' : function (browser) {
    const filePath = require('path').resolve(__dirname + '/../example_files/print.stl');
    browser
    // required for passing all the setup
    .readyFluxStudio()
    // test code start -----------

    .turnOnSupport()
    .p(20)

    // select slic3r as slicing engine
    // .switchEngine('slic3r')
    //
    // // load testing stl
    // .setValue('.arrowBox input[type=file]', filePath) // Load STL
    // // .pause(50 * 1000)
    //
    // // wait for slice ready
    // .waitForElementNotPresent('button.btn-disabled[data-ga-event=print-goto-monitor]', 30 * 1000)
    //
    // .waitForElementVisible('.preview-time-cost', 30 * 1000)

    // test code end -----------

    .keys(browser.Keys.CONTROL)
    .keys('q')
    .end();
  }
  // TODO: Test switch slicing engine to slic3r, cura, cura2
  // TODO: Test if raft, support is working
  // TODO: Test if save test is working
};
