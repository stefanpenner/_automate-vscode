"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildVersion = exports.getBuildElectronPath = exports.getDevElectronPath = exports.resolveElectronConfiguration = void 0;
const path_1 = require("path");
const mkdirp = require("mkdirp");
const extensions_1 = require("./extensions");
const vscode_uri_1 = require("vscode-uri");
const logger_1 = require("./logger");
const root = (0, path_1.join)(__dirname, '..', '..', '..');
async function resolveElectronConfiguration(options) {
    const { codePath, workspacePath, extensionsPath, userDataDir, remote, logger, logsPath, crashesPath, extraArgs } = options;
    const env = { ...process.env };
    const args = [
        workspacePath,
        '--skip-release-notes',
        '--skip-welcome',
        '--disable-telemetry',
        '--no-cached-data',
        '--disable-updates',
        '--use-inmemory-secretstorage',
        `--crash-reporter-directory=${crashesPath}`,
        '--disable-workspace-trust',
        `--extensions-dir=${extensionsPath}`,
        `--user-data-dir=${userDataDir}`,
        `--logsPath=${logsPath}`
    ];
    if (options.verbose) {
        args.push('--verbose');
    }
    if (process.platform === 'linux') {
        // --disable-dev-shm-usage: when run on docker containers where size of /dev/shm
        // partition < 64MB which causes OOM failure for chromium compositor that uses
        // this partition for shared memory.
        // Refs https://github.com/microsoft/vscode/issues/152143
        args.push('--disable-dev-shm-usage');
        // Refs https://github.com/microsoft/vscode/issues/192206
        args.push('--disable-gpu');
    }
    if (process.platform === 'darwin') {
        // On macOS force software based rendering since we are seeing GPU process
        // hangs when initializing GL context. This is very likely possible
        // that there are new displays available in the CI hardware and
        // the relevant drivers couldn't be loaded via the GPU sandbox.
        // TODO(deepak1556): remove this switch with Electron update.
        args.push('--use-gl=swiftshader');
    }
    if (remote) {
        // Replace workspace path with URI
        args[0] = `--${workspacePath.endsWith('.code-workspace') ? 'file' : 'folder'}-uri=vscode-remote://test+test/${vscode_uri_1.URI.file(workspacePath).path}`;
        if (codePath) {
            // running against a build: copy the test resolver extension
            await (0, logger_1.measureAndLog)(() => (0, extensions_1.copyExtension)(root, extensionsPath, 'vscode-test-resolver'), 'copyExtension(vscode-test-resolver)', logger);
        }
        args.push('--enable-proposed-api=vscode.vscode-test-resolver');
        const remoteDataDir = `${userDataDir}-server`;
        mkdirp.sync(remoteDataDir);
        env['TESTRESOLVER_DATA_FOLDER'] = remoteDataDir;
        env['TESTRESOLVER_LOGS_FOLDER'] = (0, path_1.join)(logsPath, 'server');
        if (options.verbose) {
            env['TESTRESOLVER_LOG_LEVEL'] = 'trace';
        }
    }
    if (!codePath) {
        args.unshift(root);
    }
    if (extraArgs) {
        args.push(...extraArgs);
    }
    const electronPath = codePath ? getBuildElectronPath(codePath) : getDevElectronPath();
    return {
        env,
        args,
        electronPath
    };
}
exports.resolveElectronConfiguration = resolveElectronConfiguration;
function getDevElectronPath() {
    const buildPath = (0, path_1.join)(root, '.build');
    const product = require((0, path_1.join)(root, 'product.json'));
    switch (process.platform) {
        case 'darwin':
            return (0, path_1.join)(buildPath, 'electron', `${product.nameLong}.app`, 'Contents', 'MacOS', 'Electron');
        case 'linux':
            return (0, path_1.join)(buildPath, 'electron', `${product.applicationName}`);
        case 'win32':
            return (0, path_1.join)(buildPath, 'electron', `${product.nameShort}.exe`);
        default:
            throw new Error('Unsupported platform.');
    }
}
exports.getDevElectronPath = getDevElectronPath;
function getBuildElectronPath(root) {
    switch (process.platform) {
        case 'darwin':
            return (0, path_1.join)(root, 'Contents', 'MacOS', 'Electron');
        case 'linux': {
            const product = require((0, path_1.join)(root, 'resources', 'app', 'product.json'));
            return (0, path_1.join)(root, product.applicationName);
        }
        case 'win32': {
            const product = require((0, path_1.join)(root, 'resources', 'app', 'product.json'));
            return (0, path_1.join)(root, `${product.nameShort}.exe`);
        }
        default:
            throw new Error('Unsupported platform.');
    }
}
exports.getBuildElectronPath = getBuildElectronPath;
function getBuildVersion(root) {
    switch (process.platform) {
        case 'darwin':
            return require((0, path_1.join)(root, 'Contents', 'Resources', 'app', 'package.json')).version;
        default:
            return require((0, path_1.join)(root, 'resources', 'app', 'package.json')).version;
    }
}
exports.getBuildVersion = getBuildVersion;
//# sourceMappingURL=electron.js.map