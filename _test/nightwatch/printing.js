module.exports = {
  'Printing Basic Testing' : function (browser) {
    const filePath = require('path').resolve(__dirname + '/../example_files/print.stl');
    browser
    // required for passing all the setup
    .readyFluxStudio()

    // test code start -----------

    .setValue('.arrowBox input[type=file]', filePath) // Load STL

    .testEngines()

    .testEditMenu()

    .p(500)

    // test code end -----------

    .keys(browser.Keys.CONTROL)
    .keys('q')
    .end();
  }
  // TODO: Test switch slicing engine to slic3r, cura, cura2
  // TODO: Test if raft, support is working
  // TODO: Test if save test is working
};
