module.exports = {
  "Demo test Google" : function (browser) {
    browser
      .url("http://www.google.com")
      .waitForElementVisible('body', 5000)
      .setValue('input[type=text]', 'nightwatch')
      .waitForElementVisible('input[name=btnI]', 2000)
      .click('input[name=btnI]').click('input[name=btnK]')
      .pause(2000)
      .assert.containsText('#main', 'The Night Watch')
      .end();
  }
};
