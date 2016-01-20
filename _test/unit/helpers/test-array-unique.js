requirejs(process.cwd() + '/public/js/helpers/array-unique.js');

describe('Array unique', function() {
    it('Single-Dimensional', function() {
        assert.deepEqual([1, 2, 3], [1, 2, 3, 1].unique());
    });

    it('Multiple-Dimensional', function() {
        assert.deepEqual([[1, 2], [3, 1]], [[1, 2], [3, 1]].unique());
    });

    it('Array Object', function() {
        assert.deepEqual(
            [{ foo: 1 }, { foo: 2 }, { foo: 1 }],
            [{ foo: 1 }, { foo: 2 }, { foo: 1 }].unique()
        );
    });
});