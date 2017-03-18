# FLUX Studio
---

## Introduction

FLUX Studio is the companion application for [FLUX Delta](http://flux3dp.com). It gives creators an intuitive interface to control over every function of the machine.

## Requirement

* Unix-like OS
* Install [Nodejs and npm](https://docs.npmjs.com/getting-started/installing-node)
* Clone [fluxghost](https://github.com/flux3dp/fluxghost) and [fluxclient](https://github.com/flux3dp/fluxclient)
* Download [slic3r](http://slic3r.org/) and [Cura v15.04.5](https://ultimaker.com/en/products/cura-software/list)

## Setup
`$> npm install --save-dev`

## Running
Install FLUXClient first (See [fluxclient](https://github.com/flux3dp/fluxclient/blob/master/README.md) and Download [fluxghost](https://github.com/flux3dp/fluxghost/blob/master/README.md))

1. `$> cd /path/to/fluxghost`

1. Start the flux api service `$> python3 ghost.py`

1. `$> cd /path/to/flux-studio`

1. Start the gulp service `$> gulp dev`

1. Open http://localhost:8111 in Chrome, open devtool, goto console, run command `localStorage.setItem('dev','true')` and refresh the page.

## Build

1. `$> [PATH]/_tools/nwjs-shell-builder/nwjs-build.sh`
    > More detail please see [nwjs-shell-builder](https://github.com/Gisto/nwjs-shell-builder)

1. Unzip file in `[PATH]/_tools/nwjs-shell-builder/TMP/output`

1. Unzip it and run `mkdir [NWJS_APP_PATH]/lib/`

1. Copy slic3r (slic3r-console.exe for Windows) and CuraEngine (CuraEngine.exe for Windows) to `[NWJS_APP_PATH]/lib/`

1. Setup fluxclient `[FLUXCLIENT_PATH]/setup.py develop`

1. Package `[FLUXGHOST_PATH]/pyinstaller --clean --noconfirm  ghost.spec`

1. Copy the folder `[FLUXGHOST_PATH]/dist/flux_api` to `[NWJS_APP_PATH]/lib/`

## License
AGPLv3
