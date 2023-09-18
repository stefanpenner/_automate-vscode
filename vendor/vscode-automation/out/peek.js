"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.References = void 0;
class References {
    constructor(code) {
        this.code = code;
    }
    async waitUntilOpen() {
        await this.code.waitForElement(References.REFERENCES_WIDGET);
    }
    async waitForReferencesCountInTitle(count) {
        await this.code.waitForTextContent(References.REFERENCES_TITLE_COUNT, undefined, titleCount => {
            const matches = titleCount.match(/\d+/);
            return matches ? parseInt(matches[0]) === count : false;
        });
    }
    async waitForReferencesCount(count) {
        await this.code.waitForElements(References.REFERENCES, false, result => result && result.length === count);
    }
    async waitForFile(file) {
        await this.code.waitForTextContent(References.REFERENCES_TITLE_FILE_NAME, file);
    }
    async close() {
        // Sometimes someone else eats up the `Escape` key
        let count = 0;
        while (true) {
            await this.code.dispatchKeybinding('escape');
            try {
                await this.code.waitForElement(References.REFERENCES_WIDGET, el => !el, 10);
                return;
            }
            catch (err) {
                if (++count > 5) {
                    throw err;
                }
            }
        }
    }
}
exports.References = References;
References.REFERENCES_WIDGET = '.monaco-editor .zone-widget .zone-widget-container.peekview-widget.reference-zone-widget.results-loaded';
References.REFERENCES_TITLE_FILE_NAME = `${References.REFERENCES_WIDGET} .head .peekview-title .filename`;
References.REFERENCES_TITLE_COUNT = `${References.REFERENCES_WIDGET} .head .peekview-title .meta`;
References.REFERENCES = `${References.REFERENCES_WIDGET} .body .ref-tree.inline .monaco-list-row .highlight`;
//# sourceMappingURL=peek.js.map