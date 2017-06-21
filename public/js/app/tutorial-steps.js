define([
    'helpers/i18n',
    'helpers/api/config'
], function(
    i18n,
    Config
) {

    let lang = i18n.get(),
        tutorialSteps;

    tutorialSteps = [
        {
            selector: '.arrowBox',
            text: lang.tutorial.startWithFilament,
            r: 0,
            position: 'top'
        },
        {
            selector: '.arrowBox',
            text: lang.tutorial.startWithModel,
            r: 0,
            position: 'bottom'
        },
        {
            selector: '.arrowBox',
            text: lang.tutorial.clickToImport,
            r: 105,
            position: 'top'
        },
        {
            selector: '.quality-select',
            text: lang.tutorial.selectQuality,
            offset_x: -25,
            r: 90,
            position: 'right'
        },
        {
            selector: 'button.btn-go',
            text: lang.tutorial.clickGo,
            offset_x: 6,
            r: 80,
            position: 'left'
        },
        {
            selector: '',
            text: Config().read('configured-model') === 'fd1' ? lang.tutorial.startPrint : lang.tutorial.startPrintDeltaPlus,
            offset_y: 25,
            r: 80,
            position: 'top'
        },
        {
            selector: '.flux-monitor .operation',
            text: Config().read('configured-model') === 'fd1' ? lang.tutorial.startPrint : lang.tutorial.startPrintDeltaPlus,
            offset_y: 25,
            r: 80,
            position: 'top'
        }
    ];

    return tutorialSteps;

});
