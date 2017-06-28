# FLUX Studio
---

## Introduction

FLUX Studio is the companion application for [FLUX Delta Series](http://flux3dp.com). It gives creators an intuitive interface to control over every function of the machine.

## Requirement

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
* Support environment variables
** `BACKEND`: path to fluxghost backend
** `GHOST_SLIC3R`: path to slic3r application
** `GHOST_CURA`: path to cura application
** `GHOST_CURA2`: path to cura2 application


## License

* AGPLv3
