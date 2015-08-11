define([
    'react',
    'jsx!widgets/Radio-Group',
    'jsx!widgets/Select'
], function(React, RadioGroupView, SelectView) {
    'use strict';

    return React.createClass({
        render: function() {
            var props = this.props,
                lang = props.lang;

            return (
                <div className={props.className}>
                    <div className="controls">
                        <p className="control">
                            <label className="caption span4">{lang.laser.object_params.position.text}</label>
                            <input type="number" name="object-pos-x" data-type="x" className="span4 instant-change" defaultValue=""/>
                            <input type="number" name="object-pos-y" data-type="y" className="span4 instant-change" defaultValue=""/>
                        </p>
                        <p className="control">
                            <span className="offset-left-4 span4 text-center unit">X</span>
                            <span className="span4 text-center unit">Y</span>
                        </p>
                    </div>
                    <div className="controls">
                        <p className="control">
                            <label className="caption span4">{lang.laser.object_params.size.text}</label>
                            <input type="number" min="0" name="object-size-w" data-type="width" className="span4 instant-change" defaultValue=""/>
                            <input type="number" min="0" name="object-size-h" data-type="height" className="span4 instant-change" defaultValue=""/>
                        </p>
                        <p className="control">
                            <span className="offset-left-4 span4 text-center unit">{lang.laser.object_params.size.unit.width}</span>
                            <span className="span4 text-center unit">{lang.laser.object_params.size.unit.height}</span>
                        </p>
                    </div>
                    <div className="controls">
                        <p className="control">
                            <label className="caption span4">{lang.laser.object_params.rotate.text}</label>
                            <input type="number" min="-180" name="object-angle" data-type="angle" className="span4 instant-change" defaultValue=""/>
                        </p>
                    </div>
                    <div className="controls">
                        <div className="control">
                            <label className="caption span4">{lang.laser.object_params.unit.text}</label>
                            <RadioGroupView className="span8 radio-group" name="object-unit" options={lang.laser.object_params.unit.options}/>
                        </div>
                    </div>
                    <div className="controls">
                        <div className="control">
                            <label className="caption span4">{lang.laser.object_params.threshold.text}</label>
                            <input type="number" min="0" max="255" className="span4" name="threshold" defaultValue={lang.laser.object_params.threshold.default}/>
                        </div>
                    </div>
                </div>
            );
        }

    });
});