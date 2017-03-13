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
    wsBehavior,
    command,
    testModel,
    totalStep,
    reportTimes = 0;

    wsReceivedMessage = {},
    wsReturnedMessage = {},

    _ok = {'status': 'ok'},
    _blob = new Blob([JSON.stringify({hello: 'world'}, null, 2)], {type : 'application/json'});
    _continue = {'status': 'continue'};

global.$ = jQuery;
injector = new Squire();

const id = 'E7DC97C9-789F-47F0-B920-C38E19572D94';
const ids = ['id1', 'id2'];
const reportSlicingResponse = [
    ({'slice_status': 'computing', 'message': 'Loaded from disk in 0.002s', 'percentage': 0.32}),
    ({'slice_status': 'computing', 'message': 'Optimize model 0.023s', 'percentage': 0.44}),
    ({'slice_status': 'computing', 'message': 'Sliced model in 0.056s', 'percentage': 0.56}),
    ({'slice_status': 'computing', 'message': 'Generated layer parts in 0.011s', 'percentage': 0.68}),
    ({'slice_status': 'computing', 'message': 'Generated inset in 0.170s', 'percentage': 0.80}),
    ({'slice_status': 'computing', 'message': 'Generated up/down skin in 0.100s', 'percentage': 0.92}),
    ({'slice_status': 'computing', 'message': 'analyzing metadata', 'percentage': 0.99}),
    ({'slice_status': 'complete', 'length': 456418, 'time': 1510.693, 'filament_length': 599.73})
];

/*
 * Section: Helper Functions
 * Description: small functions (breakdown, refactor help)
 */

const loadTestModel = () => {
    var d = $.Deferred();
    fs.readFile(process.cwd() + '/_test/api/assets/guide-example.stl', (err, data) => {
        testModel = data;
        d.resolve(data);
    });
    return d.promise();
};

const saveWsResult = (c, result) => {
    wsReturnedMessage[c] = result;
};

/*
 * Section: Web Socket
 * Description: Websocket behavior is to simulate what ws would react to the command
 */

const defaultWsBehavior = (c, received) => {
    slicer.trigger(_ok);
};

const uploadWsBehavior = (c, received) => {
    // 1. respond continue 2. send binary 3. respond ok
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

const reportSlicingWsBehavior = (c, received) => {
    slicer.trigger(reportSlicingResponse[reportTimes]);
    slicer.trigger(_ok);
    reportTimes++;
};

const getResultWsBehavior = (c, received) => {
    var okWithInfo = Object.assign({}, _ok);
    okWithInfo['info'] = _blob.size;
    slicer.trigger(okWithInfo);
    slicer.trigger(_blob);
};

const getPathWsBehavior = (c, received) => {
    slicer.trigger('[ [ [ -10.26, -1.36, 0.49, 3 ], [ -0.04, -0.06, 0.49, 0 ], [ -0.04, -0.06, 0.25, 3 ], [ 0.08, 0.05, 0.25, 0 ] ] ]');
};

/*
 * Section: Test Generator
 * Description: Conductor for directing each test
 */

function* TestMaster() {
    yield testSetParameter();
    yield testSet();
    yield testUpload();
    // yield testGoG();
    yield testGoF();
    yield testBeginSlicingF();
    yield testBeginSlicingG();
    yield testReportSlicing();
    yield testGetSlicingResult();
    yield testStopSlicing();
    yield testGetPath();
    yield testUploadPreviewImage();
    yield testDuplicate();
    yield testChangeEngine();
}

/*
 * Section: test
 * Description: Test cases for each api
 */

 const testSetParameter = () => {
     return new Promise((resolve, reject) => {
         wsBehavior = defaultWsBehavior;
         command = 'setParameter1';
         slicer.setParameter('advancedSettings', 'brim_width = 0').then((result) => {
             saveWsResult(command, result);
             command = 'setParameter2';
             return slicer.setParameter('layer_height', '0.15');
         }).then((result) => {
             saveWsResult(command, result);
             resolve();
         });
     });
 };

const testSet = () => {
    return new Promise((resolve, reject) => {
        wsBehavior = defaultWsBehavior;
        command = 'set';
        slicer.set('abc', 0, 0, 5, 0, 0, 0, 1, 1, 1).then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testUpload  = () => {
    return new Promise((resolve, reject) => {
        wsBehavior = uploadWsBehavior;
        command = 'upload';
        loadTestModel().then((model) => {
            model.size = model.length;
            return slicer.upload(id, model, 'stl');
        }).then((result) => {
            saveWsResult(command, result);
            resolve();
        }).progress((step, total, progress) => {
            totalStep = total;
        });
    });
};

// const testGoG = () => {
//     console.log(2);
//     return new Promise((resolve, reject) => {
//         wsBehavior = defaultWsBehavior;
//         command = 'goG';
//         slicer.goG(ids).then((result) => {
//             saveWsResult(command, result);
//             resolve();
//         });
//     });
// };

const testGoF = () => {
    return new Promise((resolve, reject) => {
        wsBehavior = defaultWsBehavior;
        command = 'goF';
        slicer.goF(ids).then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testBeginSlicingF = () => {
    return new Promise((resolve, reject) => {
        wsBehavior = defaultWsBehavior;
        command = 'beginSlicingF';
        slicer.beginSlicing(ids).then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testBeginSlicingG = () => {
    return new Promise((resolve, reject) => {
        wsBehavior = defaultWsBehavior;
        command = 'beginSlicingG';
        slicer.beginSlicing(ids, 'g').then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testReportSlicing = () => {
    return new Promise((resolve, reject) => {
        command = 'reportSlicing';
        wsBehavior = reportSlicingWsBehavior;
        wsReturnedMessage[command] = [];
        var t = setInterval(() => {
            slicer.reportSlicing().then((response) => {
                if(response.slice_status === 'complete') {
                    wsReturnedMessage[command].push(response);
                    clearInterval(t);
                    resolve();
                }
                else {
                    wsReturnedMessage[command].push(response);
                }
            });
        }, 10);
    });
};

const testGetSlicingResult = () => {
    return new Promise((resolve, reject) => {
        command = 'getSlicingResult';
        wsBehavior = getResultWsBehavior;
        slicer.getSlicingResult().then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testStopSlicing = () => {
    return new Promise((resolve, reject) => {
        command = 'endSlicing';
        wsBehavior = defaultWsBehavior;
        slicer.stopSlicing().then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testGetPath = () => {
    return new Promise((resolve, reject) => {
        command = 'getPath';
        wsBehavior = getPathWsBehavior;
        slicer.getPath().then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testUploadPreviewImage = () => {
    return new Promise((resolve, reject) => {
        command = 'uploadPreviewImage';
        wsBehavior = uploadWsBehavior;
        slicer.uploadPreviewImage(_blob).then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testDuplicate = () => {
    return new Promise((resolve, reject) => {
        command = 'duplicate';
        wsBehavior = defaultWsBehavior;
        slicer.duplicate('name1', 'name2').then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

const testChangeEngine = () => {
    return new Promise((resolve, reject) => {
        command = 'changeEngine';
        wsBehavior = defaultWsBehavior;
        slicer.changeEngine('cura').then((result) => {
            saveWsResult(command, result);
            resolve();
        });
    });
};

/*
 * Section: Mocha test
 * Description: Test rundown
 */

injector
    .mock('helpers/websocket', function() {
        return {
            // this is called when api called ws.send()
            send: function(result) {
                if(typeof result !== 'object') {
                    wsReceivedMessage[command] = result;
                }
                // wsReceivedMessage[command] = result;
                wsBehavior(command, result);
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

            var testMaster = TestMaster();

            const go = (result) => {
                if(result.done) {
                    done();
                }
                else {
                    result.value.then(() => {
                        go(testMaster.next());
                    });
                }
            };

            go(testMaster.next());
        });
    });

    it('should set parameter with multiple pair and single pair', () => {
        expect(wsReceivedMessage['setParameter1']).to.be.equal('advanced_setting brim_width = 0');
        expect(wsReturnedMessage['setParameter1']).to.be.equal(_ok);
        expect(wsReceivedMessage['setParameter2']).to.be.equal('advanced_setting layer_height = 0.15');
        expect(wsReturnedMessage['setParameter2']).to.be.equal(_ok);
    });

    it('set object position, rotation and scale', () => {
        expect(wsReceivedMessage['set']).to.be.equal('set abc 0 0 5 0 0 0 1 1 1');
        expect(wsReturnedMessage['set']).to.be.equal(_ok);
    });

    it('upload model to slicer', () => {
        expect(wsReceivedMessage['upload']).to.be.equal(`upload ${id} 481684`);
        expect(wsReturnedMessage['upload']).to.be.equal(_ok);
    });

    // it('go (execute) g code in the machine', () => {
    //     expect(wsReceivedMessage['goG']).to.be.equal(`go ${ids.join(' ')} -g`);
    //     expect(wsReturnedMessage['goG']).to.be.equal(_ok);
    // });

    it('go (execute) f code in the machine', () => {
        expect(wsReceivedMessage['goF']).to.be.equal(`go ${ids.join(' ')} -f`);
        expect(wsReturnedMessage['goF']).to.be.equal(_ok);
    });

    it('send begin slicing (f) command to machine', () => {
        expect(wsReceivedMessage['beginSlicingF']).to.be.equal(`begin_slicing ${ids.join(' ')} -f`);
        expect(wsReturnedMessage['beginSlicingF']).to.be.equal(_ok);
    });

    it('send begin slicing (g) command to machine', () => {
        expect(wsReceivedMessage['beginSlicingG']).to.be.equal(`begin_slicing ${ids.join(' ')} -g`);
        expect(wsReturnedMessage['beginSlicingG']).to.be.equal(_ok);
    });

    it('receive slicing report as expected', () => {
        expect(wsReceivedMessage['reportSlicing']).to.be.equal(`report_slicing`);
        expect(JSON.stringify(wsReturnedMessage['reportSlicing'])).to.be.equal(JSON.stringify(reportSlicingResponse));
    });

    it('receive a blob with the size specified', () => {
        expect(wsReceivedMessage['getSlicingResult']).to.be.equal('get_result');
        expect((wsReturnedMessage['getSlicingResult']) instanceof Blob).to.be.equal(true);
        expect(wsReturnedMessage['getSlicingResult'].size).to.be.equal(_blob.size);
    });

    it('able to stop slicing', () => {
        expect(wsReceivedMessage['endSlicing']).to.be.equal(`end_slicing`);
        expect(wsReturnedMessage['endSlicing']).to.be.equal(_ok);
    });

    it('received toolpath as expected', () => {
        expect(wsReceivedMessage['getPath']).to.be.equal('get_path');
        expect(wsReturnedMessage['getPath']).to.be.equal('[ [ [ -10.26, -1.36, 0.49, 3 ], [ -0.04, -0.06, 0.49, 0 ], [ -0.04, -0.06, 0.25, 3 ], [ 0.08, 0.05, 0.25, 0 ] ] ]');
    });

    it('upload preview image for fcode / print file preview', () => {
        expect(wsReceivedMessage['uploadPreviewImage']).to.be.equal(`upload_image ${_blob.size}`);
        expect(wsReturnedMessage['uploadPreviewImage']).to.be.equal(_ok);
    });

    it('duplicate object', () => {
        expect(wsReceivedMessage['duplicate']).to.be.equal('duplicate name1 name2');
        expect(wsReturnedMessage['duplicate']).to.be.equal(_ok);
    });

    it('change engine without problem', () => {
        expect(wsReceivedMessage['changeEngine']).to.be.equal('change_engine cura default');
        expect(wsReturnedMessage['changeEngine']).to.be.equal(_ok);
    });

});
