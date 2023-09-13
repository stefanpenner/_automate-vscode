"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
const viewlet_1 = require("./viewlet");
const VIEWLET = '.search-view';
const INPUT = `${VIEWLET} .search-widget .search-container .monaco-inputbox textarea`;
const INCLUDE_INPUT = `${VIEWLET} .query-details .file-types.includes .monaco-inputbox input`;
const FILE_MATCH = (filename) => `${VIEWLET} .results .filematch[data-resource$="${filename}"]`;
async function retry(setup, attempt) {
    let count = 0;
    while (true) {
        await setup();
        try {
            await attempt();
            return;
        }
        catch (err) {
            if (++count > 5) {
                throw err;
            }
        }
    }
}
class Search extends viewlet_1.Viewlet {
    constructor(code) {
        super(code);
    }
    async clearSearchResults() {
        await retry(() => this.code.waitAndClick(`.sidebar .title-actions .codicon-search-clear-results`), () => this.waitForNoResultText(10));
    }
    async openSearchViewlet() {
        if (process.platform === 'darwin') {
            await this.code.dispatchKeybinding('cmd+shift+f');
        }
        else {
            await this.code.dispatchKeybinding('ctrl+shift+f');
        }
        await this.waitForInputFocus(INPUT);
    }
    async getSearchTooltip() {
        const icon = await this.code.waitForElement(`.activitybar .action-label.codicon.codicon-search-view-icon`, (el) => !!el?.attributes?.['title']);
        return icon.attributes['title'];
    }
    async searchFor(text) {
        await this.clearSearchResults();
        await this.waitForInputFocus(INPUT);
        await this.code.waitForSetValue(INPUT, text);
        await this.submitSearch();
    }
    async submitSearch() {
        await this.waitForInputFocus(INPUT);
        await this.code.dispatchKeybinding('enter');
        await this.code.waitForElement(`${VIEWLET} .messages`);
    }
    async setFilesToIncludeText(text) {
        await this.waitForInputFocus(INCLUDE_INPUT);
        await this.code.waitForSetValue(INCLUDE_INPUT, text || '');
    }
    async showQueryDetails() {
        await this.code.waitAndClick(`${VIEWLET} .query-details .more`);
    }
    async hideQueryDetails() {
        await this.code.waitAndClick(`${VIEWLET} .query-details.more .more`);
    }
    async removeFileMatch(filename, expectedText) {
        const fileMatch = FILE_MATCH(filename);
        // Retry this because the click can fail if the search tree is rerendered at the same time
        await retry(async () => {
            await this.code.waitAndClick(fileMatch);
            await this.code.waitAndClick(`${fileMatch} .action-label.codicon-search-remove`);
        }, async () => this.waitForResultText(expectedText, 10));
    }
    async expandReplace() {
        await this.code.waitAndClick(`${VIEWLET} .search-widget .monaco-button.toggle-replace-button.codicon-search-hide-replace`);
    }
    async collapseReplace() {
        await this.code.waitAndClick(`${VIEWLET} .search-widget .monaco-button.toggle-replace-button.codicon-search-show-replace`);
    }
    async setReplaceText(text) {
        await this.code.waitForSetValue(`${VIEWLET} .search-widget .replace-container .monaco-inputbox textarea[title="Replace"]`, text);
    }
    async replaceFileMatch(filename, expectedText) {
        const fileMatch = FILE_MATCH(filename);
        // Retry this because the click can fail if the search tree is rerendered at the same time
        await retry(async () => {
            await this.code.waitAndClick(fileMatch);
            await this.code.waitAndClick(`${fileMatch} .action-label.codicon.codicon-search-replace-all`);
        }, () => this.waitForResultText(expectedText, 10));
    }
    async waitForResultText(text, retryCount) {
        // The label can end with " - " depending on whether the search editor is enabled
        await this.code.waitForTextContent(`${VIEWLET} .messages .message`, undefined, result => result.startsWith(text), retryCount);
    }
    async waitForNoResultText(retryCount) {
        await this.code.waitForTextContent(`${VIEWLET} .messages`, undefined, text => text === '' || text.startsWith('Search was canceled before any results could be found'), retryCount);
    }
    async waitForInputFocus(selector) {
        let retries = 0;
        // other parts of code might steal focus away from input boxes :(
        while (retries < 5) {
            await this.code.waitAndClick(INPUT, 2, 2);
            try {
                await this.code.waitForActiveElement(INPUT, 10);
                break;
            }
            catch (err) {
                if (++retries > 5) {
                    throw err;
                }
            }
        }
    }
}
exports.Search = Search;
//# sourceMappingURL=search.js.map