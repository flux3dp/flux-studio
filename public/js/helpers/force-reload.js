define(() => {
    return () => {
        if (true === window.FLUX.isNW) {
            window.FLUX.killAPI().always(function() {
                window.location.reload(true);
            });
        }
    };
});