/*globals svgEditor, svgCanvas*/
/*jslint eqeq: true*/
/*
 * ext-panning.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Luis Aguirre
 *
 */
 
/* 
	This is a very basic SVG-Edit extension to let tablet/mobile devices panning without problem
*/

svgEditor.addExtension('ext-multiselect', function() {'use strict';
    console.log("Extension load", svgCanvas);
	return {
		name: 'Extension Multiselect',
        svgicons: svgEditor.curConfig.extPath + 'ext-multiselect.xml',
		selectedChanged: function(opts) {
            if (opts && opts.elems) {
                const elems = opts.elems.filter(v => !!v);
                if (elems.length > 1) {
                    const selectedLayers = elems.map(elem => {
                        return svgCanvas.getObjectLayer(elem).title;
                    });
                    $('tr.layer').toArray().map(layer => {
                        var layerName = $(layer).find('.layername')[0];
                        if (selectedLayers.indexOf(layerName.innerHTML) > -1) {
                            $(layer).toggleClass('mark', true);
                        } 
                    });
                    return ;
                }
            }
            $('tr.layer').toggleClass('mark', false);
		}
	};
});
