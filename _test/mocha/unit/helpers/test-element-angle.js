var elementAngle = requirejs(process.cwd() + '/public/js/helpers/element-angle.js');

require('jsdom-global')();

describe('Element angle', function() {

    it('0 degree', function() {
        var el = document.createElement('div');

        assert.equal(0, elementAngle(el, 'matrix(1, 0, 0, 1, 0, 0)'));
        assert.equal(0, elementAngle(el, 'matrix(0, 0, 0, 0, 0, 0)'));
    });

    it('random degree', function() {
        var el = document.createElement('div');

        assert.equal(-38, elementAngle(el, 'matrix(0.783008, -0.622012, 0.622012, 0.783008, 0, 0)'));
        assert.equal(38, elementAngle(el, 'matrix(0.788011, 0.615661, -0.615661, 0.788011, 0, 0)'));
    });

    it('90 degree', function() {
        var el = document.createElement('div');

        assert.equal(90, elementAngle(el, 'matrix(0, 1, -1, 0, 0, 0)'));
        assert.equal(-90, elementAngle(el, 'matrix(-0.00423121, -0.999991, 0.999991, -0.00423121, 0, 0)'));
    });
});