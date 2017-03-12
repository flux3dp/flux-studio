module.exports = {
  'Machine Function Testing' : function (browser) {
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
      .pause(15000)
      .execute(function(data) {
        let menuMap = window.FLUX.menuMap,
            result = 404;
        menuMap.map((menu, i) => {
            if (menu.label !== 'Machines') { return; }
            menu.subItems.map((machineMenu) => {
                if (!machineMenu.subItems) { return; }
                machineMenu.subItems.map((machineCommand) => {
                    console.log(machineCommand);
                    if (machineCommand.id === 'calibrate') {
                        result = machineMenu.label;
                        machineCommand.onClick();
                    }
                });
            });
        });
        return result;
      }, [], (menuMap) => {
        console.log('End of execute', menuMap);
      })
      .pause(15000)
      .end();
  }
};
