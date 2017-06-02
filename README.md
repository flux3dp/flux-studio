# FLUX Studio
---

## Introduction

FLUX Studio is the companion application for [FLUX Delta Series](http://flux3dp.com). It gives creators an intuitive interface to control over every function of the machine.

## Requirement

* Unix-like OS.
* [Nodejs and npm](https://docs.npmjs.com/getting-started/installing-node).
* FLUX Studio requires websocket api to run. Dowload the source code of [FLUXGhost](https://github.com/flux3dp/fluxghost).
* Install [FLUXClient](https://github.com/flux3dp/fluxclient).
* [Slic3r](http://slic3r.org/) and [Cura v15.04.5](https://ultimaker.com/en/products/cura-software/list) binary files. For OS X users, you can also find them in /Applications/FLUX\ Studio.app folder.

## Install dependency

1. Install necessary node packages `$> npm i --save-dev`

## Build javascript/css resources

1. Build resource `$> gulp jsx sass`

## Run electron

* Run default: `npm start`
* Run with specific backend: `BACKEND=./path/to/your/flux_api npm start`

## Building for distribution

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
