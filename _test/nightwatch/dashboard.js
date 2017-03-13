module.exports = {
  'Dashboard Testing' : function (browser) {
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
      .waitForElementVisible('p.device-icon', 3000)
      .pause(1000)
      .click('p.device-icon')
      .waitForElementVisible('div.device-list', 5000)
      .waitForElementVisible('div.device-list li', 10000)
      .getText('div.device-list li .name', (el) => { console.log('\033[34m ¡ \033[0m', "Selecting", el.value); })
      .click('div.device-list li')
      .waitForElementVisible('div.modal-alert', 5000)
      .waitForElementVisible('.modal-alert input', 30000)
      .setValue('.modal-alert input', 'flux')
      .click('button[data-ga-event=confirm]')
      .waitForElementVisible('div.flux-monitor', 30000)
      .end();
  }
};
