"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launch = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const playwright = require("@playwright/test");
const playwrightDriver_1 = require("./playwrightDriver");
const electron_1 = require("./electron");
const logger_1 = require("./logger");
async function launch(options) {
    // Resolve electron config and update
    const { electronPath, args, env } = await (0, electron_1.resolveElectronConfiguration)(options);
    args.push('--enable-smoke-test-driver');
    // Launch electron via playwright
    const { electron, context, page } = await launchElectron({ electronPath, args, env }, options);
    const electronProcess = electron.process();
    return {
        electronProcess,
        driver: new playwrightDriver_1.PlaywrightDriver(electron, context, page, undefined /* no server process */, Promise.resolve() /* Window is open already */, options)
    };
}
exports.launch = launch;
async function launchElectron(configuration, options) {
    const { logger, tracing } = options;
    const electron = await (0, logger_1.measureAndLog)(() => playwright._electron.launch({
        executablePath: configuration.electronPath,
        args: configuration.args,
        env: configuration.env,
        timeout: 0
    }), 'playwright-electron#launch', logger);
    let window = electron.windows()[0];
    if (!window) {
        window = await (0, logger_1.measureAndLog)(() => electron.waitForEvent('window', { timeout: 0 }), 'playwright-electron#firstWindow', logger);
    }
    const context = window.context();
    if (tracing) {
        try {
            await (0, logger_1.measureAndLog)(() => context.tracing.start({ screenshots: true, /* remaining options are off for perf reasons */ }), 'context.tracing.start()', logger);
        }
        catch (error) {
            logger.log(`Playwright (Electron): Failed to start playwright tracing (${error})`); // do not fail the build when this fails
        }
    }
    if (options.verbose) {
        electron.on('window', () => logger.log(`Playwright (Electron): electron.on('window')`));
        electron.on('close', () => logger.log(`Playwright (Electron): electron.on('close')`));
        context.on('page', () => logger.log(`Playwright (Electron): context.on('page')`));
        context.on('requestfailed', e => logger.log(`Playwright (Electron): context.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));
        window.on('dialog', () => logger.log(`Playwright (Electron): window.on('dialog')`));
        window.on('domcontentloaded', () => logger.log(`Playwright (Electron): window.on('domcontentloaded')`));
        window.on('load', () => logger.log(`Playwright (Electron): window.on('load')`));
        window.on('popup', () => logger.log(`Playwright (Electron): window.on('popup')`));
        window.on('framenavigated', () => logger.log(`Playwright (Electron): window.on('framenavigated')`));
        window.on('requestfailed', e => logger.log(`Playwright (Electron): window.on('requestfailed') [${e.failure()?.errorText} for ${e.url()}]`));
    }
    window.on('console', e => logger.log(`Playwright (Electron): window.on('console') [${e.text()}]`));
    window.on('pageerror', async (error) => logger.log(`Playwright (Electron) ERROR: page error: ${error}`));
    window.on('crash', () => logger.log('Playwright (Electron) ERROR: page crash'));
    window.on('close', () => logger.log('Playwright (Electron): page close'));
    window.on('response', async (response) => {
        if (response.status() >= 400) {
            logger.log(`Playwright (Electron) ERROR: HTTP status ${response.status()} for ${response.url()}`);
        }
    });
    return { electron, context, page: window };
}
//# sourceMappingURL=playwrightElectron.js.map