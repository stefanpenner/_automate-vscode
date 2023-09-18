"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = void 0;
const playwright = require("@playwright/test");
const child_process_1 = require("child_process");
const path_1 = require("path");
const mkdirp = require("mkdirp");
const vscode_uri_1 = require("vscode-uri");
const logger_1 = require("./logger");
const playwrightDriver_1 = require("./playwrightDriver");
const root = (0, path_1.join)(__dirname, '..', '..', '..');
let port = 9000;
async function launch(options) {
    // Launch server
    const { serverProcess, endpoint } = await launchServer(options);
    // Launch browser
    const { browser, context, page, pageLoadedPromise } = await launchBrowser(options, endpoint);
    return {
        serverProcess,
        driver: new playwrightDriver_1.PlaywrightDriver(browser, context, page, serverProcess, pageLoadedPromise, options)
    };
}
exports.launch = launch;
async function launchServer(options) {
    const { userDataDir, codePath, extensionsPath, logger, logsPath } = options;
    const serverLogsPath = (0, path_1.join)(logsPath, 'server');
    const codeServerPath = codePath ?? process.env.VSCODE_REMOTE_SERVER_PATH;
    const agentFolder = userDataDir;
    await (0, logger_1.measureAndLog)(() => mkdirp(agentFolder), `mkdirp(${agentFolder})`, logger);
    const env = {
        VSCODE_REMOTE_SERVER_PATH: codeServerPath,
        ...process.env
    };
    const args = [
        '--disable-telemetry',
        '--disable-workspace-trust',
        `--port=${port++}`,
        '--enable-smoke-test-driver',
        `--extensions-dir=${extensionsPath}`,
        `--server-data-dir=${agentFolder}`,
        '--accept-server-license-terms',
        `--logsPath=${serverLogsPath}`
    ];
    if (options.verbose) {
        args.push('--log=trace');
    }
    let serverLocation;
    if (codeServerPath) {
        const { serverApplicationName } = require((0, path_1.join)(codeServerPath, 'product.json'));
        serverLocation = (0, path_1.join)(codeServerPath, 'bin', `${serverApplicationName}${process.platform === 'win32' ? '.cmd' : ''}`);
        logger.log(`Starting built server from '${serverLocation}'`);
    }
    else {
        serverLocation = (0, path_1.join)(root, `scripts/code-server.${process.platform === 'win32' ? 'bat' : 'sh'}`);
        logger.log(`Starting server out of sources from '${serverLocation}'`);
    }
    logger.log(`Storing log files into '${serverLogsPath}'`);
    logger.log(`Command line: '${serverLocation}' ${args.join(' ')}`);
    const serverProcess = (0, child_process_1.spawn)(serverLocation, args, { env });
    logger.log(`Started server for browser smoke tests (pid: ${serverProcess.pid})`);
    return {
        serverProcess,
        endpoint: await (0, logger_1.measureAndLog)(() => waitForEndpoint(serverProcess, logger), 'waitForEndpoint(serverProcess)', logger)
    };
}
async function launchBrowser(options, endpoint) {
    const { logger, workspacePath, tracing, headless } = options;
    const browser = await (0, logger_1.measureAndLog)(() => playwright[options.browser ?? 'chromium'].launch({
        headless: headless ?? false,
        timeout: 0
    }), 'playwright#launch', logger);
    browser.on('disconnected', () => logger.log(`Playwright: browser disconnected`));
    const context = await (0, logger_1.measureAndLog)(() => browser.newContext(), 'browser.newContext', logger);
    if (tracing) {
        try {
            await (0, logger_1.measureAndLog)(() => context.tracing.start({ screenshots: true, /* remaining options are off for perf reasons */ }), 'context.tracing.start()', logger);
        }
        catch (error) {
            logger.log(`Playwright (Browser): Failed to start playwright tracing (${error})`); // do not fail the build when this fails
        }
    }
    const page = await (0, logger_1.measureAndLog)(() => context.newPage(), 'context.newPage()', logger);
    await (0, logger_1.measureAndLog)(() => page.setViewportSize({ width: 1200, height: 800 }), 'page.setViewportSize', logger);
    if (options.verbose) {
        context.on('page', () => logger.log(`Playwright (Browser): context.on('page')`));
        context.on('requestfailed', e => logger.log(`Playwright (Browser): context.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));
        page.on('console', e => logger.log(`Playwright (Browser): window.on('console') [${e.text()}]`));
        page.on('dialog', () => logger.log(`Playwright (Browser): page.on('dialog')`));
        page.on('domcontentloaded', () => logger.log(`Playwright (Browser): page.on('domcontentloaded')`));
        page.on('load', () => logger.log(`Playwright (Browser): page.on('load')`));
        page.on('popup', () => logger.log(`Playwright (Browser): page.on('popup')`));
        page.on('framenavigated', () => logger.log(`Playwright (Browser): page.on('framenavigated')`));
        page.on('requestfailed', e => logger.log(`Playwright (Browser): page.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));
    }
    page.on('pageerror', async (error) => logger.log(`Playwright (Browser) ERROR: page error: ${error}`));
    page.on('crash', () => logger.log('Playwright (Browser) ERROR: page crash'));
    page.on('close', () => logger.log('Playwright (Browser): page close'));
    page.on('response', async (response) => {
        if (response.status() >= 400) {
            logger.log(`Playwright (Browser) ERROR: HTTP status ${response.status()} for ${response.url()}`);
        }
    });
    const payloadParam = `[${[
        '["enableProposedApi",""]',
        '["skipWelcome", "true"]',
        '["skipReleaseNotes", "true"]',
        `["logLevel","${options.verbose ? 'trace' : 'info'}"]`
    ].join(',')}]`;
    const gotoPromise = (0, logger_1.measureAndLog)(() => page.goto(`${endpoint}&${workspacePath.endsWith('.code-workspace') ? 'workspace' : 'folder'}=${vscode_uri_1.URI.file(workspacePath).path}&payload=${payloadParam}`), 'page.goto()', logger);
    const pageLoadedPromise = page.waitForLoadState('load');
    await gotoPromise;
    return { browser, context, page, pageLoadedPromise };
}
function waitForEndpoint(server, logger) {
    return new Promise((resolve, reject) => {
        let endpointFound = false;
        server.stdout?.on('data', data => {
            if (!endpointFound) {
                logger.log(`[server] stdout: ${data}`); // log until endpoint found to diagnose issues
            }
            const matches = data.toString('ascii').match(/Web UI available at (.+)/);
            if (matches !== null) {
                endpointFound = true;
                resolve(matches[1]);
            }
        });
        server.stderr?.on('data', error => {
            if (!endpointFound) {
                logger.log(`[server] stderr: ${error}`); // log until endpoint found to diagnose issues
            }
            if (error.toString().indexOf('EADDRINUSE') !== -1) {
                reject(new Error(error));
            }
        });
    });
}
//# sourceMappingURL=playwrightBrowser.js.map