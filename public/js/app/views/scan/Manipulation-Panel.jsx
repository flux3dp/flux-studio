define([
    'react',
    'jquery',
    'jsx!widgets/Unit-Input',
    'helpers/round',
], function(React, $, UnitInput, round) {
    'use strict';

    return React.createClass({
        getDefaultProps: function() {
            return {
                position: {
                    top: 0,
                    left: 0
                },
                object: {
                    position: {},
                    size: {},
                    rotation: {}
                },
                selectedMeshes: [],
                onCropOn: function() {},
                onCropOff: function() {},
                onClearNoise: function() {},
                onManualMerge: function() {},
                onReset: function() {},
                switchTransformMode: function() {},
                onChange: function(objectMatrix) {}
            };
        },

        _onClearNoise: function(e) {
            this.props.onClearNoise(this.state.handleMesh);
        },

        _onCrop: function(e) {
            var me = e.currentTarget,
                onCropping = this.state.onCropping,
                handleMesh = this.state.handleMesh;

            if (true === onCropping) {
                this.props.onCropOff(handleMesh);
            }
            else {
                this.props.onCropOn(handleMesh);
            }

            this.setState({
                onCropping: !onCropping
            });
        },

        _onManualMerge: function(e) {
            this.props.onManualMerge(e);
        },

        _onTransform: function(e) {
            var self = this,
                me = e.currentTarget,
                type = me.dataset.type.split('.'),
                parent = type[0],
                child = type[1],
                object = self.state.object;

            object[parent][child] = parseFloat(me.value, 10);

            if ('rotation' === parent) {
                object[parent][child] = Math.PI * object[parent][child] / 180;
            }

            self.setState({
                object: object
            }, function() {
                self.props.onChange(self.state.handleMesh, object);
            });
        },

        _renderForMultipleMesh: function(lang) {
            return (
                <div className="wrapper">
                    <label className="controls accordion">
                        <input type="radio" className="accordion-switcher" disabled={true} checked={true}/>
                        <p className="caption">
                            {lang.scan.manipulation.filter}
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <button className="btn btn-action btn-merge" onClick={this._onManualMerge}>
                                    <img src="/img/icon-merge.png"/>
                                    {lang.scan.manipulation.manual_merge}
                                </button>
                            </div>
                        </label>
                    </label>
                </div>
            );
        },

        _renderForSingleMesh: function(lang) {
            var props = this.props,
                state = this.state,
                position = {
                    x: round(state.object.position.x || 0, -2),
                    y: round(state.object.position.y || 0, -2),
                    z: round(state.object.position.z || 0, -2)
                },
                size = {
                    x: round(state.object.size.x || 0, -2),
                    y: round(state.object.size.y || 0, -2),
                    z: round(state.object.size.z || 0, -2)
                },
                rotation = {
                    x: round(state.object.rotation.x * 180 / Math.PI || 0, 0),
                    y: round(state.object.rotation.y * 180 / Math.PI || 0, 0),
                    z: round(state.object.rotation.z * 180 / Math.PI || 0, 0)
                },
                cx = React.addons.classSet,
                cropClass = {
                    'btn': true,
                    'btn-action': true,
                    'btn-crop': true,
                    'btn-pressed': this.state.onCropping
                };

            return (
                <div className="wrapper">
                    <label className="controls accordion">
                        <input name="maniplulation" type="radio" className="accordion-switcher" defaultChecked={true}/>
                        <p className="caption">
                            {lang.scan.manipulation.filter}
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <button className={cx(cropClass)} onClick={this._onCrop}>
                                    <img src="/img/icon-crop.png"/>
                                    {lang.scan.manipulation.crop}
                                </button>
                            </div>
                            <div className="control">
                                <button className="btn btn-action btn-denoise" onClick={this._onClearNoise}>
                                    <img src="/img/icon-denoise.png"/>
                                    {lang.scan.manipulation.clear_noise}
                                </button>
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion" onClick={this.props.switchTransformMode.bind(this, 'translate')}>
                        <input name="maniplulation" type="radio" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.scan.manipulation.position}
                            <span className="value">
                                {position.x} ,
                                {position.y} ,
                                {position.z}
                            </span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">X</span>
                                <input type="number" className="input" defaultValue={position.x} value={position.x} data-type="position.x" onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="text-center header">Y</span>
                                <input type="number" className="input" defaultValue={position.y} value={position.y} data-type="position.y" onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="text-center header">Z</span>
                                <input type="number" className="input" defaultValue={position.z} value={position.z} data-type="position.z" onChange={this._onTransform}/>
                            </div>
                        </label>
                    </label>
                    <label className="controls accordion" onClick={this.props.switchTransformMode.bind(this, 'rotate')}>
                        <input name="maniplulation" type="radio" className="accordion-switcher"/>
                        <p className="caption">
                            {lang.scan.manipulation.rotate}
                            <span className="value">
                                {rotation.x} ,
                                {rotation.y} ,
                                {rotation.z}
                            </span>
                        </p>
                        <label className="accordion-body">
                            <div className="control">
                                <span className="text-center header">X</span>
                                <input type="number" className="input" defaultValue={rotation.x} data-type="rotation.x" value={rotation.x} onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="text-center header">Y</span>
                                <input type="number" className="input" defaultValue={rotation.y} data-type="rotation.y" value={rotation.y} onChange={this._onTransform}/>
                            </div>
                            <div className="control">
                                <span className="text-center header">Z</span>
                                <input type="number" className="input" defaultValue={rotation.z} data-type="rotation.z" value={rotation.z} onChange={this._onTransform}/>
                            </div>
                        </label>
                    </label>
                </div>
            );

        },

        render: function() {
            var self = this,
                props = self.props,
                cx = React.addons.classSet,
                lang = props.lang,
                wrapperClassName,
                position,
                content;

            wrapperClassName = cx({
                'manipulation-panel' : true,
                'operating-panel' : true
            });

            position = {
                top: 0,
                left: 0,
                transform: 'translate(' + this.state.position.left + 'px, ' + this.state.position.top + 'px)',
                visible: (true === this.state.visible ? 'visible' : 'hidden')
            };

            content = (
                1 < this.props.selectedMeshes.length ?
                this._renderForMultipleMesh(lang) :
                this._renderForSingleMesh(lang)
            );

            return (
                <div className={wrapperClassName} ref="manipulationPanel" style={position}>
                    <svg className="arrow" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        width="36.8" height="20">
                        <polygon points="0,10 36.8,0 36.8,20"/>
                    </svg>
                    {content}
                </div>
            );
        },

        getInitialState: function() {
            return {
                onCropping: false,
                handleMesh: this.props.selectedMeshes[0],
                visible: false,
                position: this.props.position,
                object: this.props.object
            };
        },

        _computePosition: function(position) {
            var manipulationPanel = this.refs.manipulationPanel.getDOMNode();

            return {
                top: position.top - (manipulationPanel.offsetHeight / 2),
                left: position.left + (manipulationPanel.offsetWidth / 2)
            }
        },

        componentDidMount: function() {
            this.setState({
                visible: true,
                position: this._computePosition(this.props.position)
            });
        },

        componentWillReceiveProps: function(nextProps) {
            var manipulationPanel = this.refs.manipulationPanel.getDOMNode();
            this.setState({
                visible: true,
                handleMesh: nextProps.selectedMeshes[0],
                position: this._computePosition(nextProps.position),
                object: nextProps.object
            });
        }

    });
});