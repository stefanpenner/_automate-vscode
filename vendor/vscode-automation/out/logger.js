"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.measureAndLog = exports.MultiLogger = exports.FileLogger = exports.ConsoleLogger = void 0;
const fs_1 = require("fs");
const util_1 = require("util");
const os_1 = require("os");
class ConsoleLogger {
    log(message, ...args) {
        console.log('**', message, ...args);
    }
}
exports.ConsoleLogger = ConsoleLogger;
class FileLogger {
    constructor(path) {
        this.path = path;
        (0, fs_1.writeFileSync)(path, '');
    }
    log(message, ...args) {
        const date = new Date().toISOString();
        (0, fs_1.appendFileSync)(this.path, `[${date}] ${(0, util_1.format)(message, ...args)}${os_1.EOL}`);
    }
}
exports.FileLogger = FileLogger;
class MultiLogger {
    constructor(loggers) {
        this.loggers = loggers;
    }
    log(message, ...args) {
        for (const logger of this.loggers) {
            logger.log(message, ...args);
        }
    }
}
exports.MultiLogger = MultiLogger;
async function measureAndLog(promiseFactory, name, logger) {
    const now = Date.now();
    logger.log(`Starting operation '${name}'...`);
    let res = undefined;
    let e;
    try {
        res = await promiseFactory();
    }
    catch (error) {
        e = error;
    }
    if (e) {
        logger.log(`Finished operation '${name}' with error ${e} after ${Date.now() - now}ms`);
        throw e;
    }
    logger.log(`Finished operation '${name}' successfully after ${Date.now() - now}ms`);
    return res;
}
exports.measureAndLog = measureAndLog;
//# sourceMappingURL=logger.js.map