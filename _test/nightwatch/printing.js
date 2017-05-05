module.exports = {
  'Printing Basic Testing' : function (browser) {
    const filePath = require('path').resolve(__dirname + '/../example_files/print.stl');
    browser
    // required for passing all the setup
    .readyFluxStudio()
    // test code start -----------

    // .turnOnSupport()
    // .p(50)

    // select slic3r as slicing engine
    .switchEngine('slic3r')

    // // load testing stl
    .setValue('.arrowBox input[type=file]', filePath) // Load STL
    .waitUntilSliceFinished()

    // slic3r + raft off + support off = 1h5m
    .previewTimeShouldBe('1h5m')


    // cura seciton ==================
    .switchEngine('cura')
    .waitUntilSliceFinished()

    // raft off + support off = 1h12m
    .previewTimeShouldBe('1h12m')

    // raft on + support off = 1h24
    .toggleRaft('on')
    .previewTimeShouldBe('1h24m')

    // raft on + support on = 1h59m
    .toggleSupport('on')
    .previewTimeShouldBe('1h59m')

    // raft off + support on = 1h41m
    .toggleRaft('off')
    .previewTimeShouldBe('1h41m')
    .toggleSupport('off')

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
