define([
    'jquery'
], (
    $
) => {

    function SocketMaster() {
        let _tasks = [],
            _task,
            _ws,
            processing = false;

        const setWebSocket = (ws) => {
            _ws = ws;
            _task = null;
            _tasks = [];
        };

        const addTask = (command, ...args) => {
            // if traffic is jammed, reset
            if(_tasks.length > 50) {
                _tasks = [];
                _task = null;
            }
            let d = $.Deferred();
            _tasks.push({d, command, args});
            if(!_task && !processing) {
                doTask();
            }

            return d.promise();
        };

        const doTask = () => {
            _task = _tasks.shift();
            processing = true;

            let fnName = _task.command.split('@')[0],
                mode = _task.command.split('@')[1];

            if(mode === 'maintain' && _ws.mode !== 'maintain') {
              // Ensure maintain mode, if not then reject with "edge case" error
              _task.d.reject({status: 'error', error: ['EDGE_CASE', 'MODE_ERROR']});
            } else {
                runTaskFunction(_task, fnName);
            }
        };

        const runTaskFunction = (_task, fnName) => {
            // Do regular stuff
            let t = setTimeout(() => {
                _task.d.reject('TIMEOUT');
                doNext();
            }, 20 * 1000);

            _ws[fnName](..._task.args).then((result) => {
                processing = false;
                _task.d.resolve(result);
                doNext();
            }).progress((result) => {
                _task.d.notify(result);
            }).fail((result) => {
                processing = false;
                _task.d.reject(result);
                doNext();
            }).always(() => {
                clearTimeout(t);
            });
        };

        const doNext = () => {
            _tasks.length > 0 ? doTask() : _task = null;
        };

        const nextTask = () => ( _tasks.length > 0 ? _tasks[0] : null);

        const clearTasks = () => {
            _tasks = [];
            _task = null;
        };

        return {
            setWebSocket,
            addTask,
            doTask,
            nextTask,
            clearTasks
        };
    }

    return SocketMaster;
});
