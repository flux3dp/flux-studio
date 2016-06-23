var fs = require('fs'),
    expect = require('chai').expect,
    requirejs = require('requirejs'),
    jsdomGlobal = require('jsdom-global/register'),
    jQuery = require('jquery'),
    Squire = requirejs(__dirname + '../../../node_modules/squirejs/src/Squire.js');

    requirejs.config({
        baseUrl: 'public/js',
        paths: {
            'jquery': 'lib/jquery-1.11.0.min'
        },
        nodeRequire: require
    });

var injector,
    slicer,
    wsReceived,
    command,
    testModel,
    totalStep,

    wsReceivedMessage = {},
    wsReturnedMessage = {},

    _ok = {'status': 'ok'},
    _continue = {'status': 'continue'};

global.$ = jQuery;
injector = new Squire();

const loadTestModel = () => {
    var d = $.Deferred();
    fs.readFile(process.cwd() + '/_test/api/assets/guide-example.stl', (err, data) => {
        testModel = data;
        d.resolve(data);
    });
    return d.promise();
};

const defaultWsBehavior = (c, received) => {
    wsReceivedMessage[c] = received;
    slicer.trigger(_ok);
};

const uploadWsBehavior = (c, received) => {
    // 1. respond continue 2. send binary 3. respond ok
    if(typeof received !== 'object') {
        wsReceivedMessage[c] = received;
    }
    switch(typeof received) {
        case 'string':
            slicer.trigger(_continue);
            break;
        default:
            totalStep--;
            if(totalStep < 0) {
                slicer.trigger(_ok);
            }
            break;
    }
};

injector
    .mock('helpers/websocket', function() {
        return {
            // this is called when api called ws.send()
            send: function(result) {
                wsReceived(command, result);
            }
        };
    })
    .mock('localStorage', {
        getItem: () => {},
        setItem: () => {}
    })
    .mock('html2canvas', {
    });

describe('SLICER TEST', () => {
    before((done) => {

        injector
        .require(['helpers/api/3d-print-slicing'], (s) => {
            slicer = s();

            // testing setParameter
            wsReceived = defaultWsBehavior;
            command = 'set_parameter';
            slicer.setParameter('advancedSettings','param=1').then((result) => {
                wsReturnedMessage[command] = result;

                // testing set
                command = 'set';
                return slicer.set('abc', 0, 0, 5, 0, 0, 0, 1, 1, 1);
            }).then((result) => {
                wsReturnedMessage[command] = result;

                // testing upload
                command = 'upload';
                return loadTestModel();
            }).then((model) => {
                wsReceived = uploadWsBehavior;
                model.size = model.length;
                return slicer.upload('E7DC97C9-789F-47F0-B920-C38E19572D94', model, 'stl', (step, total)=>{
                    totalStep = total;
                });
            }).then((result) => {
                wsReturnedMessage[command] = result;

                done();
            });
        });
    });

    it('set slicer parameter', () => {
        expect(wsReceivedMessage['set_parameter']).to.be.equal('advanced_setting param=1');
        expect(wsReturnedMessage['set_parameter']).to.be.equal(_ok);
    });

    it('upload model to slicer', () => {
        expect(wsReceivedMessage['upload']).to.be.equal('upload E7DC97C9-789F-47F0-B920-C38E19572D94 481684');
        expect(wsReturnedMessage['upload']).to.be.equal(_ok);
    });

    it('set object position, rotation and scale', () => {
        expect(wsReceivedMessage['set']).to.be.equal('set abc 0 0 5 0 0 0 1 1 1');
        expect(wsReturnedMessage['set']).to.be.equal(_ok);
    });

});
