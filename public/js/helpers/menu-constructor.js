define([
    'helpers/i18n',
], function(
    i18n
) {
    let lang = i18n.get(),
        menu,
        file = {},
        edit = {},
        machines = {},
        account = {},
        help = {};

    // file section
    file.title = lang.topmenu.file.label;
    file.submenu = {
        import: { label: lang.topmenu.file.import, enabled: true },
        separator: {},
        saveFCode: { label: lang.topmenu.file.save_fcode, enabled: false },
        saveScene: { label: lang.topmenu.file.save_scene, enabled: false }
    };

    menu = {
        file
    };

    return function() {
        return menu;
    };
});
