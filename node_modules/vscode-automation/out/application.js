"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const workbench_1 = require("./workbench");
const code_1 = require("./code");
const logger_1 = require("./logger");
class Application {
    constructor(options) {
        this.options = options;
        this._userDataPath = options.userDataDir;
        this._workspacePathOrFolder = options.workspacePath;
    }
    get code() { return this._code; }
    get workbench() { return this._workbench; }
    get quality() {
        return this.options.quality;
    }
    get logger() {
        return this.options.logger;
    }
    get remote() {
        return !!this.options.remote;
    }
    get web() {
        return !!this.options.web;
    }
    get workspacePathOrFolder() {
        return this._workspacePathOrFolder;
    }
    get extensionsPath() {
        return this.options.extensionsPath;
    }
    get userDataPath() {
        return this._userDataPath;
    }
    async start() {
        await this._start();
        await this.code.waitForElement('.explorer-folders-view');
    }
    async restart(options) {
        await (0, logger_1.measureAndLog)(() => (async () => {
            await this.stop();
            await this._start(options?.workspaceOrFolder, options?.extraArgs);
        })(), 'Application#restart()', this.logger);
    }
    async _start(workspaceOrFolder = this.workspacePathOrFolder, extraArgs = []) {
        this._workspacePathOrFolder = workspaceOrFolder;
        // Launch Code...
        const code = await this.startApplication(extraArgs);
        // ...and make sure the window is ready to interact
        await (0, logger_1.measureAndLog)(() => this.checkWindowReady(code), 'Application#checkWindowReady()', this.logger);
    }
    async stop() {
        if (this._code) {
            try {
                await this._code.exit();
            }
            finally {
                this._code = undefined;
            }
        }
    }
    async startTracing(name) {
        await this._code?.startTracing(name);
    }
    async stopTracing(name, persist) {
        await this._code?.stopTracing(name, persist);
    }
    async startApplication(extraArgs = []) {
        const code = this._code = await (0, code_1.launch)({
            ...this.options,
            extraArgs: [...(this.options.extraArgs || []), ...extraArgs],
        });
        this._workbench = new workbench_1.Workbench(this._code);
        return code;
    }
    async checkWindowReady(code) {
        // We need a rendered workbench
        await (0, logger_1.measureAndLog)(() => code.didFinishLoad(), 'Application#checkWindowReady: wait for navigation to be committed', this.logger);
        await (0, logger_1.measureAndLog)(() => code.waitForElement('.monaco-workbench'), 'Application#checkWindowReady: wait for .monaco-workbench element', this.logger);
        // Remote but not web: wait for a remote connection state change
        if (this.remote) {
            await (0, logger_1.measureAndLog)(() => code.waitForTextContent('.monaco-workbench .statusbar-item[id="status.host"]', undefined, statusHostLabel => {
                this.logger.log(`checkWindowReady: remote indicator text is ${statusHostLabel}`);
                // The absence of "Opening Remote" is not a strict
                // indicator for a successful connection, but we
                // want to avoid hanging here until timeout because
                // this method is potentially called from a location
                // that has no tracing enabled making it hard to
                // diagnose this. As such, as soon as the connection
                // state changes away from the "Opening Remote..." one
                // we return.
                return !statusHostLabel.includes('Opening Remote');
            }, 300 /* = 30s of retry */), 'Application#checkWindowReady: wait for remote indicator', this.logger);
        }
    }
}
exports.Application = Application;
//# sourceMappingURL=application.js.map