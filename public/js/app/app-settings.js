define(function() {
    'use strict';

    return {
        i18n : {
            default_lang : 'en',
            supported_langs : {
                'en' : 'English',
                'zh-tw' : '繁體中文'
            }
        },

        needWebGL: ['print', 'scan'],

        params: {
            printing : {

            }
        },

        print_config: {
            color_border_out_side: 0xFF0000,
            color_border_selected: 0xFFFF00,
            color_object: 0x333333,
            color_infill: 0xEBE3AA,
            color_perimeter: 0x838689,
            color_support: 0xCAD7B2,
            color_move: 0xFFFFFF,
            color_skirt: 0x5D4157,
            color_outer_wall: 0x57595b,
            color_base_plate: 0x777777,
            color_material: 0x888888
        }
    };
});
