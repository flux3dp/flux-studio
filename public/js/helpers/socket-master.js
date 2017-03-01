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
            
            if(mode == "maintain" && _ws.mode != 'maintain') { 
              // Ensure maintain mode
              _ws.enterMaintainMode().then(() => {
                runTaskFunction(_task, fnName);
              }).fail((result) => {
                processing = false;
                _task.d.reject(result);
              });
            } else {
                runTaskFunction(_task, fnName);
            }
        };

        const runTaskFunction = (_task, fnName) => {
            // Do regular stuff
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
            });
        }

        const doNext = () => {
            _tasks.length > 0 ? doTask() : _task = null;
        };

        const nextTask = () => ( _tasks.length > 0 ? _tasks[0] : null);

        const clearTasks = () => {
            _tasks = [];
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
