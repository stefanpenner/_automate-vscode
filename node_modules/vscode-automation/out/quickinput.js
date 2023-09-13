"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickInput = void 0;
class QuickInput {
    constructor(code) {
        this.code = code;
    }
    async waitForQuickInputOpened(retryCount) {
        await this.code.waitForActiveElement(QuickInput.QUICK_INPUT_INPUT, retryCount);
    }
    async type(value) {
        await this.code.waitForSetValue(QuickInput.QUICK_INPUT_INPUT, value);
    }
    async waitForQuickInputElementFocused() {
        await this.code.waitForTextContent(QuickInput.QUICK_INPUT_FOCUSED_ELEMENT);
    }
    async waitForQuickInputElementText() {
        return this.code.waitForTextContent(QuickInput.QUICK_INPUT_ENTRY_LABEL_SPAN);
    }
    async closeQuickInput() {
        await this.code.dispatchKeybinding('escape');
        await this.waitForQuickInputClosed();
    }
    async waitForQuickInputElements(accept) {
        await this.code.waitForElements(QuickInput.QUICK_INPUT_ENTRY_LABEL, false, els => accept(els.map(e => e.textContent)));
    }
    async waitForQuickInputClosed() {
        await this.code.waitForElement(QuickInput.QUICK_INPUT, r => !!r && r.attributes.style.indexOf('display: none;') !== -1);
    }
    async selectQuickInputElement(index, keepOpen) {
        await this.waitForQuickInputOpened();
        for (let from = 0; from < index; from++) {
            await this.code.dispatchKeybinding('down');
        }
        await this.code.dispatchKeybinding('enter');
        if (!keepOpen) {
            await this.waitForQuickInputClosed();
        }
    }
}
exports.QuickInput = QuickInput;
QuickInput.QUICK_INPUT = '.quick-input-widget';
QuickInput.QUICK_INPUT_INPUT = `${QuickInput.QUICK_INPUT} .quick-input-box input`;
QuickInput.QUICK_INPUT_ROW = `${QuickInput.QUICK_INPUT} .quick-input-list .monaco-list-row`;
QuickInput.QUICK_INPUT_FOCUSED_ELEMENT = `${QuickInput.QUICK_INPUT_ROW}.focused .monaco-highlighted-label`;
// Note: this only grabs the label and not the description or detail
QuickInput.QUICK_INPUT_ENTRY_LABEL = `${QuickInput.QUICK_INPUT_ROW} .quick-input-list-row > .monaco-icon-label .label-name`;
QuickInput.QUICK_INPUT_ENTRY_LABEL_SPAN = `${QuickInput.QUICK_INPUT_ROW} .monaco-highlighted-label`;
//# sourceMappingURL=quickinput.js.map