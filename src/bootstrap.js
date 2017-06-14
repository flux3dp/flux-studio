'use strict';

const os = require('os');
const path = require('path');
const {app} = require('electron');
const resourcesRoot = process.defaultApp ? '.' : process.resourcesPath;

function bootstrap_macos() {
    console.log("Bootstrap macos");
    process.env.BACKEND = process.env.BACKEND || path.join(resourcesRoot, 'backend', 'flux_api', 'flux_api');
    process.env.GHOST_SLIC3R = process.env.GHOST_SLIC3R || path.join(resourcesRoot, 'backend', 'slic3r');
    process.env.GHOST_CURA = process.env.GHOST_CURA || path.join(resourcesRoot, 'backend', 'CuraEngine');
    process.env.GHOST_CURA2 = process.env.GHOST_CURA2 || path.join(resourcesRoot, 'backend', 'CuraEngine2');
    console.log(`### backend: ${process.env.BACKEND}`);
}

function bootstrap_linux() {
    console.log("Bootstrap linux");
    bootstrap_macos();
    console.log(`### slic3r: ${process.env.BACKEND}`);
}

function bootstrap_windows() {
    console.log("Bootstrap windows");
    process.env.BACKEND = process.env.BACKEND || path.join(resourcesRoot, 'backend', 'flux_api', 'flux_api.exe');
    process.env.GHOST_SLIC3R = process.env.GHOST_SLIC3R || path.join(resourcesRoot, 'backend', 'Slic3r', 'slic3r.exe');
    process.env.GHOST_CURA = process.env.GHOST_CURA || path.join(resourcesRoot, 'backend', 'CuraEngine', 'CuraEngine.exe');
    process.env.GHOST_CURA2 = process.env.GHOST_CURA2 || path.join(resourcesRoot, 'backend', 'CuraEngine2', 'CuraEngine2.exe');
    console.log(`### backend: ${process.env.BACKEND}`);
}

process.env.appVersion = app.getVersion();

switch(os.platform()) {
    case 'darwin':
        bootstrap_macos();
        break;
    case 'freebsd':
    case 'linux':
        bootstrap_linux();
        break;
    case 'win32':
        bootstrap_windows();
        break;
    default:
        throw `System ${os.platform()} not support`;
}
