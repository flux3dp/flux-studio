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


    class Text extends React.Component {
        constructor(props) {
            super(props);

            //should handle imported unusable font in other place,
            //font should e sanitized when user import new file
            const sanitizedDefaultFontFamily = (() => {
                const availableFontFamilies = this.getFontFamilyOptions();

                // use these font if props.fontFamily cannot find in user PC
                const fontFamilyFallback = ['TimeNewRoman', 'PingFang TC', 'Arial', availableFontFamilies[0]];

                const sanitizedFontFamily = [props.fontFamily, ...fontFamilyFallback].find(
                    f => availableFontFamilies.includes(f)
                );

                return sanitizedFontFamily;
            })();

            if (sanitizedDefaultFontFamily !== props.fontFamily) {
                console.log(`unsupported font ${props.fontFamily}, fallback to ${sanitizedDefaultFontFamily}`);
                FnWrapper.update_font_family(sanitizedDefaultFontFamily);
            }

            this.state = {
                fontFamily: sanitizedDefaultFontFamily,
                fontStyle: props.fontStyle,
                fontSize: props.fontSize,
                letterSpacing: props.letterSpacing
            };
        }

        getFontFamilyOptions() {
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
        }

        getFontStyleOptions() {
            console.log('this.state.fontFamily: ', this.state.fontFamily);
            const fonts = ipc.sendSync(events.FIND_FONTS, { family: this.state.fontFamily });
            console.log('fonts: ', fonts);
            const fontStyles = Array.from(fonts).map(font => font.style);
            console.log('fontStyles: ', fontStyles);
            return fontStyles;
        }

        handleFontFamilyChange(val) {
            FnWrapper.update_font_family(val);
            this.setState({
                fontFamily: val
            });
        }
        handleFontStyleChange(val) {
            console.log('fontStyle: ', val);
            this.setState({
                fontStyle: val
            });
        }
        handleFontSizeChange(val) {
            console.log('fontSize', val);
            this.setState({
                fontSize: val
            });
        }
        handleLetterSpacingChange(val) {
            console.log('letterSpacing', val);
            this.setState({
                letterSpacing: val
            });
        }

        render() {
            return (
                <div className="object-panel">
                    <label className="controls accordion">
                        <input type="checkbox" className="accordion-switcher" defaultChecked={true} />
                        <p className="caption">
                            {LANG.text || '文字'}
                            <span className="value">{this.state.fontFamily} {this.state.fontStyle}</span>
                        </p>
                        <label className="accordion-body">
                            <div>
                                <div className="control">
                                    <FontFamilySelector
                                        currentFontFamily={this.state.fontFamily}
                                        fontFamilyOptions={this.getFontFamilyOptions()}
                                        onChange={val => this.handleFontFamilyChange(val)}
                                    />
                                    <FontStyleSelector
                                        currentFontStyle={this.state.fontStyle}
                                        fontStyleOptions={this.getFontStyleOptions()}
                                        onChange={val => this.handleFontStyleChange(val)}
                                    />
                                    <FontSizeInput
                                        currentFontSize={this.state.fontSize}
                                        onChange={val => this.handleFontSizeChange(val)}
                                    />
                                    <LetterSpacingInput
                                        currentLetterSpacing={this.state.letterSpacing}
                                        onChange={val => this.handleLetterSpacingChange(val)}
                                    />
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
