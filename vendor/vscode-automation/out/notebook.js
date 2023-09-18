"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notebook = void 0;
const activeRowSelector = `.notebook-editor .monaco-list-row.focused`;
class Notebook {
    constructor(quickAccess, quickInput, code) {
        this.quickAccess = quickAccess;
        this.quickInput = quickInput;
        this.code = code;
    }
    async openNotebook() {
        await this.quickAccess.openFileQuickAccessAndWait('notebook.ipynb', 1);
        await this.quickInput.selectQuickInputElement(0);
        await this.code.waitForElement(activeRowSelector);
        await this.focusFirstCell();
        await this.waitForActiveCellEditorContents('code()');
    }
    async focusNextCell() {
        await this.code.dispatchKeybinding('down');
    }
    async focusFirstCell() {
        await this.quickAccess.runCommand('notebook.focusTop');
    }
    async editCell() {
        await this.code.dispatchKeybinding('enter');
    }
    async stopEditingCell() {
        await this.quickAccess.runCommand('notebook.cell.quitEdit');
    }
    async waitForTypeInEditor(text) {
        const editor = `${activeRowSelector} .monaco-editor`;
        await this.code.waitForElement(editor);
        const textarea = `${editor} textarea`;
        await this.code.waitForActiveElement(textarea);
        await this.code.waitForTypeInEditor(textarea, text);
        await this._waitForActiveCellEditorContents(c => c.indexOf(text) > -1);
    }
    async waitForActiveCellEditorContents(contents) {
        return this._waitForActiveCellEditorContents(str => str === contents);
    }
    async _waitForActiveCellEditorContents(accept) {
        const selector = `${activeRowSelector} .monaco-editor .view-lines`;
        return this.code.waitForTextContent(selector, undefined, c => accept(c.replace(/\u00a0/g, ' ')));
    }
    async waitForMarkdownContents(markdownSelector, text) {
        const selector = `${activeRowSelector} .markdown ${markdownSelector}`;
        await this.code.waitForTextContent(selector, text);
    }
    async insertNotebookCell(kind) {
        if (kind === 'markdown') {
            await this.quickAccess.runCommand('notebook.cell.insertMarkdownCellBelow');
        }
        else {
            await this.quickAccess.runCommand('notebook.cell.insertCodeCellBelow');
        }
    }
    async deleteActiveCell() {
        await this.quickAccess.runCommand('notebook.cell.delete');
    }
    async focusInCellOutput() {
        await this.quickAccess.runCommand('notebook.cell.focusInOutput');
        await this.code.waitForActiveElement('webview, .webview');
    }
    async focusOutCellOutput() {
        await this.quickAccess.runCommand('notebook.cell.focusOutOutput');
    }
    async executeActiveCell() {
        await this.quickAccess.runCommand('notebook.cell.execute');
    }
    async executeCellAction(selector) {
        await this.code.waitAndClick(selector);
    }
}
exports.Notebook = Notebook;
//# sourceMappingURL=notebook.js.map