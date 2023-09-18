"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.teardown = void 0;
const util_1 = require("util");
const treekill = require("tree-kill");
async function teardown(p, logger, retryCount = 3) {
    const pid = p.pid;
    if (typeof pid !== 'number') {
        return;
    }
    let retries = 0;
    while (retries < retryCount) {
        retries++;
        try {
            return await (0, util_1.promisify)(treekill)(pid);
        }
        catch (error) {
            try {
                process.kill(pid, 0); // throws an exception if the process doesn't exist anymore
                logger.log(`Error tearing down process (pid: ${pid}, attempt: ${retries}): ${error}`);
            }
            catch (error) {
                return; // Expected when process is gone
            }
        }
    }
    logger.log(`Gave up tearing down process client after ${retries} attempts...`);
}
exports.teardown = teardown;
//# sourceMappingURL=processes.js.map