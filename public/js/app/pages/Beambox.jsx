define([
    'react',
    'app/actions/beambox',
    'jsx!views/beambox/Left-Panel',
    'jsx!pages/svg-editor',
    'jsx!widgets/Button-Group',
    'helpers/api/config',
    'helpers/i18n',
], function(
    React,
    laserEvents,
    LeftPanel,
    SvgGenerator,
    ButtonGroup,
    ConfigHelper,
    i18n
) {

    let Config = ConfigHelper(),
        lang = i18n.lang;

        'use strict';

    return function(args = {}) {
        let Svg = SvgGenerator(args);
            self = this;

        class view extends React.Component {
          constructor(){
            super();
            this.laserEvents = laserEvents();
          //  this.state = {
          //    options: {
          //        material: lang.laser.advanced.form.object_options.options[0],
          //        laserEvents: laserEvents.call(this, args),
          //        test: 0,
          //        objectHeight: 0,
          //        heightOffset: 0,
          //        isShading: false
          //    }
          //  }
          }

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

          _fetchFormalSettings(holder) {
              let options = Config.read('laser-defaults') || {},
                  max = lang.laser.advanced.form.power.max;
              return {
                  object_height: options.objectHeight,
                  height_offset: options.heightOffset || 0,
                  laser_speed: options.material.data.laser_speed,
                  //calibration: holder.state.debug || 0,
                  calibration: 0,
                  power: options.material.data.power / max,
                  //shading: (true === holder.refs.setupPanel.isShading() ? 1 : 0)
                  shading: true
              };
          }

          _handleExportClick(filemode) {
              this.laserEvents.exportTaskCode(this._fetchFormalSettings(), filemode);
          }

          _renderActionButtons() {
              console.log('randerActionButtons', this);
              //globalInteraction.onImageChanged(this.state.hasImage);

              var cx = React.addons.classSet,
                  buttons = [{
                      label: lang.laser.get_fcode,
                      className: cx({
                          //'btn-disabled': !this.state.hasImage,
                          'btn-disabled': false,
                          'btn-default': true,
                          'btn-hexagon': true,
                          'btn-get-fcode': true
                      }),
                      dataAttrs: {
                          'ga-event': 'get-laser-fcode'
                      },
                      onClick: this._handleExportClick.bind(this, '-f')
                  }, {
                      label: lang.monitor.start,
                      className: cx({
                          //'btn-disabled': !this.state.hasImage,
                          'btn-disabled': false,
                          'btn-default': true,
                          'btn-hexagon': true,
                          'btn-go': true
                      }),
                      dataAttrs: {
                          'ga-event': 'laser-goto-monitor'
                      },
                      //onClick: this._handleStartClick
                  }];

              if (this.props.page === 'laser') {
                  buttons = [{
                      label: lang.laser.showOutline,
                      className: cx({
                          //'btn-disabled': !this.state.hasImage,
                          'btn-disabled': false,
                          'btn-default': true,
                          'btn-hexagon': true,
                          'btn-go': true
                      }),
                      dataAttrs: {
                          'ga-event': 'holder-outline'
                      },
                      //onClick: this._handleShowOutlineClick
                  }].concat(buttons);
              }

              return (
                  <ButtonGroup buttons={buttons} className="beehive-buttons action-buttons"/>
              );
          }

          _renderLeftPanel() {
          return (<LeftPanel/>);
          }

          render() {
            var actionButtons = this._renderActionButtons();
            var leftPanel = this._renderLeftPanel();
            return (
                    <div className="studio-container beambox-studio">
                        {leftPanel}
                        <Svg />
                        {actionButtons}
                    </div>
            );
          }
        }

        return view;
    };
});
