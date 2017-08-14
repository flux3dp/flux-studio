define([
    'react',
    'jsx!pages/svg-editor',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    SvgGenerator,
    ConfigHelper,
    i18n
) {

    let Config = ConfigHelper(),
        lang = i18n.lang;

        'use strict';

    return function(args = {}) {
        let Svg = SvgGenerator(args);

        class view extends React.Component {
          constructor(props){
            super(props);
            this.state = {
              options: {
                  material: lang.laser.advanced.form.object_options.options[0],
                  objectHeight: 0,
                  heightOffset: 0,
                  isShading: false
              }
            }
          }

          //static get defaultProps() {
          //    return {
          //        page: React.PropTypes.string
          //    }
          //}

          componentDidMount() {
            let options = Config.read('laser-defaults') || {};
            if (options.material == null) {
                options.material = lang.laser.advanced.form.object_options.options[0];
            }

            options.objectHeight = options.objectHeight || 0;
            options.heightOffset = options.heightOffset || (Config.read('default-model') === 'fd1p' ? -2.3 : 0);
            options.isShading = !!options.isShading;
            if (!Config.read('laser-defaults')) {
                Config.write('laser-defaults', options);
            }
            this.setState({options});

          }

        //  _fetchFormalSettings(hilder) {
        //      let options = Config.read('laser-defaults') || {},
        //          max = lang.laser.advanced.form.power.ma
        //      return {
        //          object_height: options.objectHeight,
        //          height_offset: options.heightOffset || 0,
        //          laser_speed: options.material.data.laser_speed,
        //          calibration: holder.state.debug || 0,
        //          power: options.material.data.power / max,
        //          shading: (true === holder.refs.setupPanel.isShading() ? 1 : 0)
        //      };
        //  }
//
        //  _renderSetupPanel(holder) {
        //      return <LaserSetupPanel
        //          page={holder.props.page}
        //          className="operating-panel"
        //          imageFormat={holder.state.fileFormat}
        //          defaults={holder.state.panelOptions}
        //          onLoadCalibrationImage = { holder._onLoadCalibrationImage }
        //          ref="setupPanel"
        //          onShadingChanged={holder._onShadingChanged}
        //      />;
      //  }
          getIframelyHtml() {
            return {
              __html: '<div><iframe src="http://127.0.0.1:8111/js/lib/svgeditor/svg-editor.html" \
                        width=1000 height=600" \
                        style=" position: absolute; \
                                left: 50%; \
                                top: 100px; \
                                transform: translate(-50%);">\
                      </iframe></div>'
            };
          }

          render() {
            //return <div dangerouslySetInnerHTML={this.getIframelyHtml()} />
            return <Svg />
          }
        }

        return view;
    };
});
