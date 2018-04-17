define([
    'app/actions/beambox/svgeditor-function-wrapper',
    'helpers/i18n',
], function(
    FnWrapper,
    i18n
) {

    if (!window.electron) {
        console.log('font is not supported in web browser');
        return {};
    }
    const ipc = electron.ipc;
    const events = electron.events;
    const activeLang = i18n.getActiveLang();

    const hashCode = function(s) {
        var h = 0, l = s.length, i = 0;
        if ( l > 0 ){
            while (i < l) {
                h = (h << 5) - h + s.charCodeAt(i++) | 0;
            }
        }
        return Math.abs(h);
    };
    const availableFontFamilies = (function requestAvailableFontFamilies() {
        // get all available fonts in user PC
        const fonts = ipc.sendSync(events.GET_AVAILABLE_FONTS);

        // make it unique
        const fontFamilySet = new Set();
        fonts.map(font => fontFamilySet.add(font.family));

        // transfer to array and sort!
        return Array.from(fontFamilySet).sort((a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
    })();
    const requestFontStylesOfTheFontFamily = (family) => {
        // if you don't specify italic, it will just return fonts that are not italic
        const fontsNoItalic = ipc.sendSync(events.FIND_FONTS, { family: family, italic: false });
        const fontsItalic = ipc.sendSync(events.FIND_FONTS, { family: family, italic: true });
        const fonts = fontsNoItalic.concat(fontsItalic);
        const fontStyles = Array.from(fonts).map(font => font.style);

        return fontStyles;
    };
    const requestFontByFamilyAndStyle = ({family, style, weight, italic}) => {
        const font = ipc.sendSync(events.FIND_FONT, {
            family: family,
            style: style,
            weight: weight,
            italic: italic
        });
        return font;
    };
    const requestToConvertTextToPath = async ($textElement) => {
        const d = $.Deferred();

        const fontStyle = requestFontByFamilyAndStyle({
            family: $textElement.attr('font-family'),
            weight: $textElement.attr('font-weight'),
            italic: ($textElement.attr('font-style') === 'italic')
        }).style;

        const transform = $textElement.attr('transform') || '';

        const letterSpacing = (function() {
            const letterSpacingAttr = $textElement.attr('letter-spacing');
            if (!letterSpacingAttr) {
                return 0;
            } else {
                return letterSpacingAttr.replace('em', '');
            }
        })();

        // use key (which hash from $textElement html string) to prevent ipc event confliction
        const key = hashCode($textElement.prop('outerHTML'));
        ipc.once(events.RESOLVE_PATH_D_OF_TEXT + key, (sender, pathD) => {
            d.resolve(pathD);
        });

        ipc.send(events.REQUEST_PATH_D_OF_TEXT, {
            text: $textElement.text(),
            x: $textElement.attr('x'),
            y: $textElement.attr('y'),
            fontFamily: $textElement.attr('font-family'),
            fontSize: $textElement.attr('font-size'),
            fontStyle: fontStyle,
            letterSpacing: letterSpacing,
            key: key
        });
        const pathD = await d;

        const path = document.createElementNS(window.svgedit.NS.SVG, 'path');

        const isFill = (function(){
            const fillAttr = $textElement.attr('fill');
            if (['#fff', '#ffffff', 'none'].includes(fillAttr)) {
                return false;
            } else if(fillAttr || fillAttr === null) {
                return true;
            } else {
                return false;
            }
        })();

        $(path).attr({
            'id': svgCanvas.getNextId(),
            'd': pathD,
            'transform': transform,
            'fill': isFill ? '#000' : '#fff',
            'fill-opacity': isFill ? 1 : 0,
            'stroke': '#000',
            'stroke-width': 1,
            'stroke-opacity': 1,
            'stroke-dasharray': 'none',
            'vector-effect': 'non-scaling-stroke',
        });

        $(path).insertAfter($textElement);
        $textElement.remove();

        return;
    };
    const convertTextToPathAmoungSvgcontent = async () => {
        FnWrapper.reset_select_mode();
        const allPromises = $('#svgcontent')
            .find('text')
            .toArray()
            .map(
                el => requestToConvertTextToPath($(el))
            );
        return await Promise.all(allPromises);
    };

    // <Map> family -> fullName
    const fontNameMap = (function requestEachFontFullname() {
        if (activeLang !== 'zh-tw') {
            return new Map(
                availableFontFamilies.map(family => [family, family])
            );
        }

        const nameMap = new Map([
            ['Hannotate TC', '手扎體-繁'],
            ['Hannotate SC', '手扎體-簡'],
            ['Hiragino Sans GB', '冬青黑體簡體中文'],
            ['STFangsong', '華文仿宋'],
            ['STSong', '華文宋體'],
            ['STXihei', '華文黑體'],
            ['STKaiti', '華文楷體'],
            ['Songti TC', '宋體-繁'],
            ['Songti SC', '宋體-簡'],
            ['Heiti TC', '黑體-繁'],
            ['Heiti SC', '黑體-簡'],
            ['PingFang HK', '蘋方-繁'],
            ['PingFang TC', '蘋方-繁'],
            ['PingFang SC', '蘋方-簡'],
            ['Xingkai TC', '行楷-繁'],
            ['Xingkai SC', '行楷-簡'],
            ['Wawati TC', '娃娃體-繁'],
            ['Wawati SC', '娃娃體-簡'],
            ['LingWai TC', '凌慧體-繁'],
            ['LingWai SC', '凌慧體-簡'],
            ['Baoli TC', '報隸-繁'],
            ['Baoli SC', '報隸-簡'],
            ['Yuppy TC', '雅痞-繁'],
            ['Yuppy SC', '雅痞-簡'],
            ['Yuanti TC', '圓體-繁'],
            ['Yuanti SC', '圓體-簡'],
            ['Kaiti TC', '楷體-繁'],
            ['Kaiti SC', '楷體-簡'],
            ['HanziPen TC', '翩翩體-繁'],
            ['HanziPen SC', '翩翩體-簡'],
            ['Libian TC', '隸變-繁'],
            ['Libian SC', '隸變-簡'],
            ['Weibei TC', '魏碑-繁'],
            ['Weibei SC', '魏碑-簡'],
            ['Lantinghei TC', '蘭亭黑-繁'],
            ['Lantinghei SC', '蘭亭黑-簡'],
            ['Apple LiSung Light', '蘋果儷細宋'],

            ['SimSun', '宋體'],
            ['SimHei', '黑體'],
            ['Microsoft YaHei', '微軟雅黑'],
            ['Microsoft JhengHei', '微軟正黑體'],
            ['NSimSun', '新宋體'],
            ['PMingLiU', '新细明體'],
            ['MingLiU', '细明體'],
            ['DFKai-SB', '標楷體'],
            ['FangSong', '仿宋'],
            ['KaiTi', '楷體'],
            ['FangSong_GB2312', '仿宋_GB2312'],
            ['KaiTi_GB2312', '楷體_GB2312'],
            ['STHeiti Light [STXihei]', '華文细黑'],
            ['STHeiti', '華文黑體'],
            ['STKaiti', '華文楷體'],
            ['STSong', '華文宋體'],
            ['STFangsong', '華文仿宋'],
            ['LiHei Pro Medium', '儷黑 Pro'],
            ['LiSong Pro Light', '儷宋 Pro'],
            ['BiauKai', '標楷體'],
            ['Apple LiGothic Medium', '蘋果儷中黑'],
            ['Apple LiSung Light', '蘋果儷細宋'],

            ['PMingLiU', '新細明體'],
            ['MingLiU', '細明體'],
            ['DFKai-SB', '標楷體'],
            ['SimHei', '黑體'],
            ['NSimSun', '新宋體'],
            ['FangSong', '仿宋'],
            ['KaiTi', '楷體'],
            ['FangSong_GB2312', '仿宋_GB2312'],
            ['KaiTi_GB2312', '楷體_GB2312'],
            ['Microsoft JhengHei', '微軟正黑體'],
            ['Microsoft YaHei', '微軟雅黑體'],

            ['LiSu', '隸書'],
            ['YouYuan', '幼圓'],
            ['STXihei', '華文细黑'],
            ['STKaiti', '華文楷體'],
            ['STSong', '華文宋體'],
            ['STZhongsong', '華文中宋'],
            ['STFangsong', '華文仿宋'],
            ['FZShuTi', '方正舒體'],
            ['FZYaoti', '方正姚體'],
            ['STCaiyun', '華文彩云'],
            ['STHupo', '華文琥珀'],
            ['STLiti', '華文隸書'],
            ['STXingkai', '華文行楷'],
            ['STXinwei', '華文新魏'],
        ]);

        return new Map(
            availableFontFamilies.map(family => {
                return [family, nameMap.get(family) || family];
            })
        );
    })();
    return {
        availableFontFamilies: availableFontFamilies,
        fontNameMap: fontNameMap,
        requestFontStylesOfTheFontFamily: requestFontStylesOfTheFontFamily,
        requestFontByFamilyAndStyle: requestFontByFamilyAndStyle,
        requestToConvertTextToPath: requestToConvertTextToPath,
        convertTextToPathAmoungSvgcontent: convertTextToPathAmoungSvgcontent
    };
});
