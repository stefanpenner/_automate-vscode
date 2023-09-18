"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Explorer = void 0;
const viewlet_1 = require("./viewlet");
class Explorer extends viewlet_1.Viewlet {
    constructor(code) {
        super(code);
    }
    async openExplorerView() {
        if (process.platform === 'darwin') {
            await this.code.dispatchKeybinding('cmd+shift+e');
        }
        else {
            await this.code.dispatchKeybinding('ctrl+shift+e');
        }
    }
    async waitForOpenEditorsViewTitle(fn) {
        await this.code.waitForTextContent(Explorer.OPEN_EDITORS_VIEW, undefined, fn);
    }
    getExtensionSelector(fileName) {
        const extension = fileName.split('.')[1];
        if (extension === 'js') {
            return 'js-ext-file-icon ext-file-icon javascript-lang-file-icon';
        }
        else if (extension === 'json') {
            return 'json-ext-file-icon ext-file-icon json-lang-file-icon';
        }
        else if (extension === 'md') {
            return 'md-ext-file-icon ext-file-icon markdown-lang-file-icon';
        }
        throw new Error('No class defined for this file extension');
    }
}
exports.Explorer = Explorer;
Explorer.EXPLORER_VIEWLET = 'div[id="workbench.view.explorer"]';
Explorer.OPEN_EDITORS_VIEW = `${Explorer.EXPLORER_VIEWLET} .split-view-view:nth-child(1) .title`;
//# sourceMappingURL=explorer.js.map