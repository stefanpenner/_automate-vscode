"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
class StatusBar {
    constructor(code) {
        this.code = code;
        this.mainSelector = 'footer[id="workbench.parts.statusbar"]';
    }
    async waitForStatusbarElement(element) {
        await this.code.waitForElement(this.getSelector(element));
    }
    async clickOn(element) {
        await this.code.waitAndClick(this.getSelector(element));
    }
    async waitForEOL(eol) {
        return this.code.waitForTextContent(this.getSelector(6 /* StatusBarElement.EOL_STATUS */), eol);
    }
    async waitForStatusbarText(title, text) {
        await this.code.waitForTextContent(`${this.mainSelector} .statusbar-item[title="${title}"]`, text);
    }
    getSelector(element) {
        switch (element) {
            case 0 /* StatusBarElement.BRANCH_STATUS */:
                return `.statusbar-item[id^="status.scm."] .codicon.codicon-git-branch`;
            case 1 /* StatusBarElement.SYNC_STATUS */:
                return `.statusbar-item[id^="status.scm."] .codicon.codicon-sync`;
            case 2 /* StatusBarElement.PROBLEMS_STATUS */:
                return `.statusbar-item[id="status.problems"]`;
            case 3 /* StatusBarElement.SELECTION_STATUS */:
                return `.statusbar-item[id="status.editor.selection"]`;
            case 4 /* StatusBarElement.INDENTATION_STATUS */:
                return `.statusbar-item[id="status.editor.indentation"]`;
            case 5 /* StatusBarElement.ENCODING_STATUS */:
                return `.statusbar-item[id="status.editor.encoding"]`;
            case 6 /* StatusBarElement.EOL_STATUS */:
                return `.statusbar-item[id="status.editor.eol"]`;
            case 7 /* StatusBarElement.LANGUAGE_STATUS */:
                return `.statusbar-item[id="status.editor.mode"]`;
            default:
                throw new Error(element);
        }
    }
}
exports.StatusBar = StatusBar;
//# sourceMappingURL=statusbar.js.map