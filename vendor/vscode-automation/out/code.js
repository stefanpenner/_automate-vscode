"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.findElements = exports.findElement = exports.Code = exports.launch = void 0;
const os = require("os");
const treekill = require("tree-kill");
const logger_1 = require("./logger");
const playwrightBrowser_1 = require("./playwrightBrowser");
const playwrightElectron_1 = require("./playwrightElectron");
const processes_1 = require("./processes");
const instances = new Set();
function registerInstance(process, logger, type) {
    const instance = { kill: () => (0, processes_1.teardown)(process, logger) };
    instances.add(instance);
    process.stdout?.on('data', data => logger.log(`[${type}] stdout: ${data}`));
    process.stderr?.on('data', error => logger.log(`[${type}] stderr: ${error}`));
    process.once('exit', (code, signal) => {
        logger.log(`[${type}] Process terminated (pid: ${process.pid}, code: ${code}, signal: ${signal})`);
        instances.delete(instance);
    });
}
async function teardownAll(signal) {
    stopped = true;
    for (const instance of instances) {
        await instance.kill();
    }
    if (typeof signal === 'number') {
        process.exit(signal);
    }
}
let stopped = false;
process.on('exit', () => teardownAll());
process.on('SIGINT', () => teardownAll(128 + 2)); // https://nodejs.org/docs/v14.16.0/api/process.html#process_signal_events
process.on('SIGTERM', () => teardownAll(128 + 15)); // same as above
async function launch(options) {
    if (stopped) {
        throw new Error('Smoke test process has terminated, refusing to spawn Code');
    }
    // Browser smoke tests
    if (options.web) {
        const { serverProcess, driver } = await (0, logger_1.measureAndLog)(() => (0, playwrightBrowser_1.launch)(options), 'launch playwright (browser)', options.logger);
        registerInstance(serverProcess, options.logger, 'server');
        return new Code(driver, options.logger, serverProcess);
    }
    // Electron smoke tests (playwright)
    else {
        const { electronProcess, driver } = await (0, logger_1.measureAndLog)(() => (0, playwrightElectron_1.launch)(options), 'launch playwright (electron)', options.logger);
        registerInstance(electronProcess, options.logger, 'electron');
        return new Code(driver, options.logger, electronProcess);
    }
}
exports.launch = launch;
class Code {
    constructor(driver, logger, mainProcess) {
        this.logger = logger;
        this.mainProcess = mainProcess;
        this.driver = new Proxy(driver, {
            get(target, prop) {
                if (typeof prop === 'symbol') {
                    throw new Error('Invalid usage');
                }
                const targetProp = target[prop];
                if (typeof targetProp !== 'function') {
                    return targetProp;
                }
                return function (...args) {
                    logger.log(`${prop}`, ...args.filter(a => typeof a === 'string'));
                    return targetProp.apply(this, args);
                };
            }
        });
    }
    async startTracing(name) {
        return await this.driver.startTracing(name);
    }
    async stopTracing(name, persist) {
        return await this.driver.stopTracing(name, persist);
    }
    async dispatchKeybinding(keybinding) {
        await this.driver.dispatchKeybinding(keybinding);
    }
    async didFinishLoad() {
        return this.driver.didFinishLoad();
    }
    async exit() {
        return (0, logger_1.measureAndLog)(() => new Promise(resolve => {
            const pid = this.mainProcess.pid;
            let done = false;
            // Start the exit flow via driver
            this.driver.exitApplication();
            // Await the exit of the application
            (async () => {
                let retries = 0;
                while (!done) {
                    retries++;
                    switch (retries) {
                        // after 5 / 10 seconds: try to exit gracefully again
                        case 10:
                        case 20: {
                            this.logger.log('Smoke test exit call did not terminate process after 5-10s, gracefully trying to exit the application again...');
                            this.driver.exitApplication();
                            break;
                        }
                        // after 20 seconds: forcefully kill
                        case 40: {
                            this.logger.log('Smoke test exit call did not terminate process after 20s, forcefully exiting the application...');
                            // no need to await since we're polling for the process to die anyways
                            treekill(pid, err => {
                                try {
                                    process.kill(pid, 0); // throws an exception if the process doesn't exist anymore
                                    this.logger.log('Failed to kill Electron process tree:', err?.message);
                                }
                                catch (error) {
                                    // Expected when process is gone
                                }
                            });
                            break;
                        }
                        // after 30 seconds: give up
                        case 60: {
                            done = true;
                            this.logger.log('Smoke test exit call did not terminate process after 30s, giving up');
                            resolve();
                        }
                    }
                    try {
                        process.kill(pid, 0); // throws an exception if the process doesn't exist anymore.
                        await this.wait(500);
                    }
                    catch (error) {
                        done = true;
                        resolve();
                    }
                }
            })();
        }), 'Code#exit()', this.logger);
    }
    async waitForTextContent(selector, textContent, accept, retryCount) {
        accept = accept || (result => textContent !== undefined ? textContent === result : !!result);
        return await this.poll(() => this.driver.getElements(selector).then(els => els.length > 0 ? Promise.resolve(els[0].textContent) : Promise.reject(new Error('Element not found for textContent'))), s => accept(typeof s === 'string' ? s : ''), `get text content '${selector}'`, retryCount);
    }
    async waitAndClick(selector, xoffset, yoffset, retryCount = 200) {
        await this.poll(() => this.driver.click(selector, xoffset, yoffset), () => true, `click '${selector}'`, retryCount);
    }
    async waitForSetValue(selector, value) {
        await this.poll(() => this.driver.setValue(selector, value), () => true, `set value '${selector}'`);
    }
    async waitForElements(selector, recursive, accept = result => result.length > 0) {
        return await this.poll(() => this.driver.getElements(selector, recursive), accept, `get elements '${selector}'`);
    }
    async waitForElement(selector, accept = result => !!result, retryCount = 200) {
        return await this.poll(() => this.driver.getElements(selector).then(els => els[0]), accept, `get element '${selector}'`, retryCount);
    }
    async waitForActiveElement(selector, retryCount = 200) {
        await this.poll(() => this.driver.isActiveElement(selector), r => r, `is active element '${selector}'`, retryCount);
    }
    async waitForTitle(accept) {
        await this.poll(() => this.driver.getTitle(), accept, `get title`);
    }
    async waitForTypeInEditor(selector, text) {
        await this.poll(() => this.driver.typeInEditor(selector, text), () => true, `type in editor '${selector}'`);
    }
    async waitForTerminalBuffer(selector, accept) {
        await this.poll(() => this.driver.getTerminalBuffer(selector), accept, `get terminal buffer '${selector}'`);
    }
    async writeInTerminal(selector, value) {
        await this.poll(() => this.driver.writeInTerminal(selector, value), () => true, `writeInTerminal '${selector}'`);
    }
    getLocaleInfo() {
        return this.driver.getLocaleInfo();
    }
    getLocalizedStrings() {
        return this.driver.getLocalizedStrings();
    }
    getLogs() {
        return this.driver.getLogs();
    }
    wait(millis) {
        return this.driver.wait(millis);
    }
    async poll(fn, acceptFn, timeoutMessage, retryCount = 200, retryInterval = 100 // millis
    ) {
        let trial = 1;
        let lastError = '';
        while (true) {
            if (trial > retryCount) {
                this.logger.log('Timeout!');
                this.logger.log(lastError);
                this.logger.log(`Timeout: ${timeoutMessage} after ${(retryCount * retryInterval) / 1000} seconds.`);
                throw new Error(`Timeout: ${timeoutMessage} after ${(retryCount * retryInterval) / 1000} seconds.`);
            }
            let result;
            try {
                result = await fn();
                if (acceptFn(result)) {
                    return result;
                }
                else {
                    lastError = 'Did not pass accept function';
                }
            }
            catch (e) {
                lastError = Array.isArray(e.stack) ? e.stack.join(os.EOL) : e.stack;
            }
            await this.wait(retryInterval);
            trial++;
        }
    }
}
exports.Code = Code;
function findElement(element, fn) {
    const queue = [element];
    while (queue.length > 0) {
        const element = queue.shift();
        if (fn(element)) {
            return element;
        }
        queue.push(...element.children);
    }
    return null;
}
exports.findElement = findElement;
function findElements(element, fn) {
    const result = [];
    const queue = [element];
    while (queue.length > 0) {
        const element = queue.shift();
        if (fn(element)) {
            result.push(element);
        }
        queue.push(...element.children);
    }
    return result;
}
exports.findElements = findElements;
//# sourceMappingURL=code.js.map