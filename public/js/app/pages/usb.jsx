define([
    'jquery',
    'react'
], function($, React) {
    'use strict';

    return function(args) {
        args = args || {};

        var view = React.createClass({
            _handleSlideToggle: function(e) {
                var _target = e.target.attributes["data-target"].value;
                $('#' + _target).slideToggle();
            },
            render : function() {
                var lang = args.state.lang;

                return (
                    <div className="usb">
                        <div className="usb-sidebar">
                            <div className="usb-sidebar-header">My Drive</div>
                            <div className="usb-sidebar-body">
                                <div className="folder">
                                    <div className="folder-icon"><img src="img/icon-folder.png" height="30px" /></div>
                                    <div className="folder-name">Folder Name</div>
                                    <div className="expand-icon"><img src="img/icon-arrow-d.png" height="35px" /></div>
                                </div>
                                <div className="folder">
                                    <div className="folder-icon"><img src="img/icon-folder.png" height="30px" /></div>
                                    <div className="folder-name">Folder Name</div>
                                    <div className="expand-icon">
                                        <img src="img/icon-arrow-d.png" height="35px" data-target="exp" onClick={this._handleSlideToggle} /></div>
                                </div>
                                <div className="hide" id="exp">
                                    <div className="file level2">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file1.gcode</div>
                                    </div>
                                    <div className="file level2">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file2.gcode</div>
                                    </div>
                                    <div className="file level2">
                                        <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                        <div className="file-name">file3.gcode</div>
                                    </div>
                                </div>
                                <div className="file">
                                    <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                    <div className="file-name">file1.gcode</div>
                                </div>
                                <div className="file">
                                    <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                    <div className="file-name">file2.gcode</div>
                                </div>
                                <div className="file">
                                    <div className="file-icon"><img src="http://placehold.it/35x35" /></div>
                                    <div className="file-name">file3.gcode</div>
                                </div>
                            </div>
                            <div className="usb-sidebar-footer">
                                <a className="btn btn-print green full-width align-bottom no-border-radius">Print</a>
                            </div>
                        </div>

                        <div className="file-content">
                            <div className="main-content"></div>
                            <div className="file-detail align-bottom">
                                <div className="file-name">file1.gcode</div>
                                <div className="detail-info">
                                    <div className="row-fluid">
                                        <div className="span2 info-header">Size</div>
                                        <div className="span8 info-content">100 MB</div>
                                    </div>
                                    <div className="row-fluid">
                                        <div className="span2 info-header">Created</div>
                                        <div className="span8 info-content">xxxx/xx/xx, xx:xx AM</div>
                                    </div>
                                    <div className="row-fluid">
                                        <div className="span2 info-header">Modified</div>
                                        <div className="span8 info-content">xxxx/xx/xx, xx:xx AM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        return view;
    };
});