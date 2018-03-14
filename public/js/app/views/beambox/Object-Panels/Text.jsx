define([
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'jsx!views/beambox/Object-Panels/text/FontFamily',
    'jsx!views/beambox/Object-Panels/text/FontStyle',
    'jsx!views/beambox/Object-Panels/text/FontSize',
    'jsx!views/beambox/Object-Panels/text/LetterSpacing',
    'helpers/i18n',
], function(React, PropTypes, FnWrapper, FontFamilySelector, FontStyleSelector, FontSizeInput, LetterSpacingInput, i18n) {

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

        console.log('fonts: ', fonts);
        console.log('fontStyles: ', fontStyles);

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
                        weight: props.weight,
                        italic: props.italic
                    }).style,
                    fontSize: props.fontSize,
                    letterSpacing: props.letterSpacing
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

        convertToPath() {
            console.log('TODO: convert to path');
        }

        render() {
            console.log('render');
            const fontStyles = requestFontStylesOfTheFontFamily(this.state.fontFamily);
            console.log('fontStyles: ', fontStyles);
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            {LANG.text}
                            <span className="value">{this.state.fontFamily}, {this.state.fontStyle}</span>
                        </p>
                        <label className="accordion-body">
                            <div>
                                <div className="control">
                                    <FontFamilySelector
                                        currentFontFamily={this.state.fontFamily}
                                        fontFamilyOptions={requestAvailableFontFamilies()}
                                        onChange={val => this.handleFontFamilyChange(val)}
                                    />
                                    <FontStyleSelector
                                        currentFontStyle={this.state.fontStyle}
                                        fontStyleOptions={fontStyles}
                                        onChange={val => this.handleFontStyleChange(val)}
                                    />
                                    <br/>
                                    <div className="text-center header" style={{fontSize: '16px'}}>{LANG.font_size}</div>
                                    <FontSizeInput
                                        currentFontSize={this.state.fontSize}
                                        onChange={val => this.handleFontSizeChange(val)}
                                    />
                                    <div className="text-center header" style={{fontSize: '16px'}}>{LANG.letter_spacing}</div>
                                    <LetterSpacingInput
                                        currentLetterSpacing={this.state.letterSpacing}
                                        onChange={val => this.handleLetterSpacingChange(val)}
                                    />
                                    <button
                                        className='btn-default'
                                        onClick={() => this.convertToPath()}
                                    >
                                        LANG.convert_to_path
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
        fontStyle: PropTypes.string.isRequired,
        fontSize: PropTypes.string.isRequired,
        letterSpacing: PropTypes.string.isRequired
    };

    return Text;
});
