define([
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/progress-actions',
    'app/constants/progress-constants',
    'jsx!views/beambox/Object-Panels/text/FontFamily',
    'jsx!views/beambox/Object-Panels/text/FontStyle',
    'jsx!views/beambox/Object-Panels/text/FontSize',
    'jsx!views/beambox/Object-Panels/text/LetterSpacing',
    'jsx!views/beambox/Object-Panels/text/FontFill',
    'helpers/i18n',
], function(
    React,
    PropTypes,
    FnWrapper,
    ProgressActions,
    ProgressConstants,
    FontFamilySelector,
    FontStyleSelector,
    FontSizeInput,
    LetterSpacingInput,
    IsFillCheckbox,
    i18n
) {

    if (!window.electron) {
        console.log('font is not supported in web browser');
        return () => null;
    }
    const ipc = electron.ipc;
    const events = electron.events;

    const LANG = i18n.lang.beambox.object_panels;

    const requestAvailableFontFamilies = () => {
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
    };
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
    const requestToConvertTextToPath = async ({text, x, y, fontFamily, fontSize, fontStyle, transform, letterSpacing}) => {
        const d = $.Deferred();
        ipc.once(events.RESOLVE_PATH_D_OF_TEXT, (sender, pathD) => {
            d.resolve(pathD);
        });

        ipc.send(events.REQUEST_PATH_D_OF_TEXT, {
            text: text,
            x: x,
            y: y,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontStyle: fontStyle,
            letterSpacing: letterSpacing
        });
        const pathD = await d;
        const path = document.createElementNS(window.svgedit.NS.SVG, 'path');
        path.setAttribute('d', pathD);
        path.setAttribute('transform', transform);
        path.setAttribute('fill', '#fff');
        path.setAttribute('fill-opacity', 0);
        path.setAttribute('stroke', '#000');
        path.setAttribute('stroke-width', 1);
        path.setAttribute('stroke-opacity', 1);
        path.setAttribute('stroke-dasharray', 'none');
        path.setAttribute('vector-effect', 'non-scaling-stroke');

        return path;
    };
    class Text extends React.Component {
        constructor(props) {
            super(props);

            //should handle imported unusable font in other place,
            //font should e sanitized when user import new file
            const i_am_sure_i_want_to_sanitize_font_family_here = false;
            if (i_am_sure_i_want_to_sanitize_font_family_here) {

                // const sanitizedDefaultFontFamily = (() => {
                //     const availableFontFamilies = requestAvailableFontFamilies();

                //     // use these font if props.fontFamily cannot find in user PC
                //     const fontFamilyFallback = ['TimeNewRoman', 'PingFang TC', 'Arial', availableFontFamilies[0]];

                //     const sanitizedFontFamily = [props.fontFamily, ...fontFamilyFallback].find(
                //         f => availableFontFamilies.includes(f)
                //     );

                //     return sanitizedFontFamily;
                // })();

                // if (sanitizedDefaultFontFamily !== props.fontFamily) {
                //     console.log(`unsupported font ${props.fontFamily}, fallback to ${sanitizedDefaultFontFamily}`);
                //     FnWrapper.update_font_family(sanitizedDefaultFontFamily);
                // }

                // this.state = {
                //     fontFamily: sanitizedDefaultFontFamily,
                //     fontStyle: props.fontStyle,
                //     fontSize: props.fontSize,
                //     letterSpacing: props.letterSpacing
                // };
            } else {
                this.state = {
                    fontFamily: props.fontFamily,
                    fontStyle: requestFontByFamilyAndStyle({
                        family: props.fontFamily,
                        weight: props.fontWeight,
                        italic: props.italic
                    }).style,
                    fontSize: props.fontSize,
                    letterSpacing: props.letterSpacing,
                    isFill: props.isFill
                };
            }
        }

        handleFontFamilyChange(newFamily) {
            // update family
            FnWrapper.update_font_family(newFamily);

            // new style
            const newStyle = requestFontStylesOfTheFontFamily(newFamily)[0];

            // set fontFamily and change fontStyle
            this.setState({
                fontFamily: newFamily
            }, this.handleFontStyleChange(newStyle));
        }
        handleFontStyleChange(val) {
            const font = requestFontByFamilyAndStyle({
                family: this.state.fontFamily,
                style: val
            });
            FnWrapper.update_font_italic(font.italic);
            FnWrapper.update_font_weight(font.weight);
            this.setState({
                fontStyle: val
            });
        }
        handleFontSizeChange(val) {
            FnWrapper.update_font_size(val);
            this.setState({
                fontSize: val
            });
        }
        handleLetterSpacingChange(val) {
            FnWrapper.update_letter_spacing(val);
            this.setState({
                letterSpacing: val
            });
        }
        handleIsFillChange(val) {
            FnWrapper.update_font_is_fill(val);
            this.setState({
                isFill: val
            });
        }
        async convertToPath() {
            const path = await requestToConvertTextToPath({
                text: this.props.$me.text(),
                x: this.props.$me.attr('x'),
                y: this.props.$me.attr('y'),
                fontFamily: this.state.fontFamily,
                fontSize: this.state.fontSize,
                fontStyle: this.state.fontStyle,
                letterSpacing: this.state.letterSpacing,
                transform: (this.props.$me.attr('transform')||'')
            });
            svgCanvas.setMode('select');

            $(svgroot).trigger({
                type: 'mousedown',
                pageX: 0,
                pageY: 0
            });
            $(svgroot).trigger({
                type: 'mouseup',
                pageX: 0,
                pageY: 0
            });
            $(path).insertAfter(this.props.$me);
            this.props.$me.remove();
            svgCanvas.textActions.clear();
            window.updateContextPanel();
        }

        render() {
            const fontStyles = requestFontStylesOfTheFontFamily(this.state.fontFamily);
            return (
                <div className='object-panel text-panel'>
                    <label className='controls accordion'>
                        <input type='checkbox' className='accordion-switcher' defaultChecked={true} />
                        <p className='caption'>
                            {LANG.text}
                            <span className='value'>{this.state.fontFamily}, {this.state.fontStyle}</span>
                        </p>
                        <label className='accordion-body'>
                            <div>
                                <div className='control'>
                                    <FontFamilySelector
                                        currentFontFamily={this.state.fontFamily}
                                        fontFamilyOptions={requestAvailableFontFamilies()}
                                        onChange={val => this.handleFontFamilyChange(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <FontStyleSelector
                                        currentFontStyle={this.state.fontStyle}
                                        fontStyleOptions={fontStyles}
                                        onChange={val => this.handleFontStyleChange(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <div className='text-center header' style={{fontSize: '16px'}}>{LANG.font_size}</div>
                                    <FontSizeInput
                                        currentFontSize={this.state.fontSize}
                                        onChange={val => this.handleFontSizeChange(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <div className='text-center header' style={{fontSize: '16px'}}>{LANG.letter_spacing}</div>
                                    <LetterSpacingInput
                                        currentLetterSpacing={this.state.letterSpacing}
                                        onChange={val => this.handleLetterSpacingChange(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <div className='text-center header' style={{fontSize: '16px'}}>{LANG.fill}</div>
                                    <IsFillCheckbox
                                        currentIsFill={this.state.isFill}
                                        onChange={val => this.handleIsFillChange(val)}
                                    />
                                </div>
                                <div className='control'>
                                    <button
                                        className='btn-default'
                                        onClick={async () => {
                                            ProgressActions.open(ProgressConstants.WAITING, LANG.wait_for_parsing_font);
                                            //delay this.convertToPath() to ensure ProgressActions has already popup
                                            await new Promise(resolve => {
                                                setTimeout(async () => {
                                                    await this.convertToPath();
                                                    resolve();
                                                }, 50);
                                            });
                                            ProgressActions.close();
                                        }}
                                        style={{
                                            width: '100%',
                                            lineHeight: '1.5em'
                                        }}
                                    >
                                        {LANG.convert_to_path}
                                    </button>
                                </div>
                            </div>
                        </label>
                    </label>
                </div>
            );
        }
    }
    Text.propTypes = {
        fontFamily: PropTypes.string.isRequired,
        fontWeight: PropTypes.number.isRequired,
        italic: PropTypes.bool.isRequired,
        fontSize: PropTypes.number.isRequired,
        letterSpacing: PropTypes.number.isRequired
    };

    return Text;
});
