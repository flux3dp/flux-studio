module.exports.command = function(id, callback) {

    this.execute(function(id) {
        window.FLUX.menuMap.forEach((menu) => {
            menu.subItems.forEach((item) => {
              if(item.id === id) {
                  item.onClick();
              }
            });
        });
    }, [id], () => {
        if (typeof callback === 'function') {
            callback.call(this);
        }
    });

    return this;
};
