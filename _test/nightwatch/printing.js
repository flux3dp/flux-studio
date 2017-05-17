module.exports = {
  'Printing Basic Testing' : function (browser) {

    browser
    .log('ready flux studio')
    .readyFluxStudio()
    .log('ready nightwatch-print')
    .readyPrintDevice()

    // test code start -----------

    .testImportFileTypes()
    // .testEngines()
    // .testEditMenu()
    // .testActualPrint()

    .p(500)

    // test code end -----------

    .keys(browser.Keys.CONTROL)
    .keys('q')
    .end();

  }
};
