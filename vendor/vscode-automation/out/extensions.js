"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyExtension = exports.Extensions = void 0;
const viewlet_1 = require("./viewlet");
const path = require("path");
const fs = require("fs");
const ncp_1 = require("ncp");
const util_1 = require("util");
class Extensions extends viewlet_1.Viewlet {
    constructor(code, commands) {
        super(code);
        this.commands = commands;
    }
    async searchForExtension(id) {
        await this.commands.runCommand('workbench.extensions.action.focusExtensionsView');
        await this.code.waitForTypeInEditor('div.extensions-viewlet[id="workbench.view.extensions"] .monaco-editor textarea', `@id:${id}`);
        await this.code.waitForTextContent(`div.part.sidebar div.composite.title h2`, 'Extensions: Marketplace');
        let retrials = 1;
        while (retrials++ < 10) {
            try {
                return await this.code.waitForElement(`div.extensions-viewlet[id="workbench.view.extensions"] .monaco-list-row[data-extension-id="${id}"]`, undefined, 100);
            }
            catch (error) {
                this.code.logger.log(`Extension '${id}' is not found. Retrying count: ${retrials}`);
                await this.commands.runCommand('workbench.extensions.action.refreshExtension');
            }
        }
        throw new Error(`Extension ${id} is not found`);
    }
    async openExtension(id) {
        await this.searchForExtension(id);
        await this.code.waitAndClick(`div.extensions-viewlet[id="workbench.view.extensions"] .monaco-list-row[data-extension-id="${id}"]`);
    }
    async closeExtension(title) {
        await this.code.waitAndClick(`.tabs-container div.tab[title="Extension: ${title}"] div.tab-actions a.action-label.codicon.codicon-close`);
    }
    async installExtension(id, waitUntilEnabled) {
        await this.searchForExtension(id);
        await this.code.waitAndClick(`div.extensions-viewlet[id="workbench.view.extensions"] .monaco-list-row[data-extension-id="${id}"] .extension-list-item .monaco-action-bar .action-item:not(.disabled) .extension-action.install`);
        await this.code.waitForElement(`.extension-editor .monaco-action-bar .action-item:not(.disabled) .extension-action.uninstall`);
        if (waitUntilEnabled) {
            await this.code.waitForElement(`.extension-editor .monaco-action-bar .action-item:not(.disabled)[title="Disable this extension"]`);
        }
    }
}
exports.Extensions = Extensions;
async function copyExtension(repoPath, extensionsPath, extId) {
    const dest = path.join(extensionsPath, extId);
    if (!fs.existsSync(dest)) {
        const orig = path.join(repoPath, 'extensions', extId);
        return (0, util_1.promisify)(ncp_1.ncp)(orig, dest);
    }
}
exports.copyExtension = copyExtension;
//# sourceMappingURL=extensions.js.map