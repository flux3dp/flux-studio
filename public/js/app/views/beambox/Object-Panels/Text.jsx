define([
    'react',
    'reactPropTypes',
    'app/actions/beambox/svgeditor-function-wrapper',
    'app/actions/beambox/font-funcs',
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
    FontFuncs,
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

    const LANG = i18n.lang.beambox.object_panels;
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
                    fontStyle: FontFuncs.requestFontByFamilyAndStyle({
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
            const newStyle = FontFuncs.requestFontStylesOfTheFontFamily(newFamily)[0];

            // set fontFamily and change fontStyle
            this.setState({
                fontFamily: newFamily
            }, this.handleFontStyleChange(newStyle));
        }
        handleFontStyleChange(val) {
            const font = FontFuncs.requestFontByFamilyAndStyle({
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
            ProgressActions.open(ProgressConstants.WAITING, LANG.wait_for_parsing_font);
            //delay FontFuncs.requestToConvertTextToPath() to ensure ProgressActions has already popup
            await new Promise(resolve => {
                setTimeout(async () => {
                    await FontFuncs.requestToConvertTextToPath(this.props.$me);
                    resolve();
                }, 50);
            });
            ProgressActions.close();

            FnWrapper.reset_select_mode();

        }

        render() {
            const fontStyles = FontFuncs.requestFontStylesOfTheFontFamily(this.state.fontFamily);
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
                                        fontFamilyOptions={FontFuncs.availableFontFamilies}
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
                                        onClick={() => this.convertToPath()}
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
