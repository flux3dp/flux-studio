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

        default_engine: 'cura',

        print_config: {
            color_border_out_side: 0xFF0000,
            color_border_selected: 0xFFFF00,
            color_object: 0x333333,
            color_infill: 0xf1c40f,
            color_perimeter: 0x3498db,
            color_support: 0xbdc3c7,
            color_move: 0xFFFFFF,
            color_skirt: 0x5D4157,
            color_innerwall: 0x2ecc71,
            color_raft: 0xe67e22,
            color_skin: 0xe67e22,
            color_highlight: 0x9b59b6,
            color_base_plate: 0x777777,
            color_material: 0x888888,
            color_default: 0xA17898
        }

        // print_config: {
        //     color_border_out_side: 0xFF0000,
        //     color_border_selected: 0xFFFF00,
        //     color_object: 0x333333,
        //     color_infill: 0xEBE3AA,
        //     color_perimeter: 0x838689,
        //     color_support: 0xCAD7B2,
        //     color_move: 0xFFFFFF,
        //     color_skirt: 0x5D4157,
        //     color_outer_wall: 0x57595b,
        //     color_innerwall: 0x57595b,
        //     color_raft: 0x57595b,
        //     color_skin: 0x57595b,
        //     color_highlight: 0xFFFFFF,
        //     color_base_plate: 0x777777,
        //     color_material: 0x888888,
        //     color_default: 0xA17898
        // }
    };
});
