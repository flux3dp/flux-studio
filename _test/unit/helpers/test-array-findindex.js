requirejs('public/js/helpers/array-findindex');

describe('Array', function() {

    describe('Index doesnt exist', function() {
        it('with strict equality', function() {

            assert.equal(-1, [1, 2, 3].findIndex(function(el) {
                return false;
            }));

            assert.equal(-1, [1, 2, 3].findIndex(function(el) {
                return 0 === el;
            }));

            assert.equal(-1, [1, 2, 3].findIndex(function(el) {
                return '1' === el;
            }));

            assert.equal(-1, [1, 2, 3].findIndex(function(el) {
                return undefined === el;
            }));
        });
    });

    describe('Index does exist', function() {
        it('with loose equality', function() {
            assert.notEqual(-1, [1, 2, 3].findIndex(function(el) {
                return true;
            }));

            assert.notEqual(-1, [1, 2, 3].findIndex(function(el) {
                return '1' == el;
            }));

            assert.notEqual(-1, [0, 1, 2, 3].findIndex(function(el) {
                return '' == el;
            }));
        });
    });
});