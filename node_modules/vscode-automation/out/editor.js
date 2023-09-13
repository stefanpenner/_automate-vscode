"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editor = void 0;
const peek_1 = require("./peek");
const RENAME_BOX = '.monaco-editor .monaco-editor.rename-box';
const RENAME_INPUT = `${RENAME_BOX} .rename-input`;
const EDITOR = (filename) => `.monaco-editor[data-uri$="${filename}"]`;
const VIEW_LINES = (filename) => `${EDITOR(filename)} .view-lines`;
const LINE_NUMBERS = (filename) => `${EDITOR(filename)} .margin .margin-view-overlays .line-numbers`;
class Editor {
    constructor(code, commands) {
        this.code = code;
        this.commands = commands;
    }
    async findReferences(filename, term, line) {
        await this.clickOnTerm(filename, term, line);
        await this.commands.runCommand('Peek References');
        const references = new peek_1.References(this.code);
        await references.waitUntilOpen();
        return references;
    }
    async rename(filename, line, from, to) {
        await this.clickOnTerm(filename, from, line);
        await this.commands.runCommand('Rename Symbol');
        await this.code.waitForActiveElement(RENAME_INPUT);
        await this.code.waitForSetValue(RENAME_INPUT, to);
        await this.code.dispatchKeybinding('enter');
    }
    async gotoDefinition(filename, term, line) {
        await this.clickOnTerm(filename, term, line);
        await this.commands.runCommand('Go to Implementations');
    }
    async peekDefinition(filename, term, line) {
        await this.clickOnTerm(filename, term, line);
        await this.commands.runCommand('Peek Definition');
        const peek = new peek_1.References(this.code);
        await peek.waitUntilOpen();
        return peek;
    }
    async getSelector(filename, term, line) {
        const lineIndex = await this.getViewLineIndex(filename, line);
        const classNames = await this.getClassSelectors(filename, term, lineIndex);
        return `${VIEW_LINES(filename)}>:nth-child(${lineIndex}) span span.${classNames[0]}`;
    }
    async foldAtLine(filename, line) {
        const lineIndex = await this.getViewLineIndex(filename, line);
        await this.code.waitAndClick(Editor.FOLDING_EXPANDED.replace('${INDEX}', '' + lineIndex));
        await this.code.waitForElement(Editor.FOLDING_COLLAPSED.replace('${INDEX}', '' + lineIndex));
    }
    async unfoldAtLine(filename, line) {
        const lineIndex = await this.getViewLineIndex(filename, line);
        await this.code.waitAndClick(Editor.FOLDING_COLLAPSED.replace('${INDEX}', '' + lineIndex));
        await this.code.waitForElement(Editor.FOLDING_EXPANDED.replace('${INDEX}', '' + lineIndex));
    }
    async clickOnTerm(filename, term, line) {
        const selector = await this.getSelector(filename, term, line);
        await this.code.waitAndClick(selector);
    }
    async waitForEditorFocus(filename, lineNumber, selectorPrefix = '') {
        const editor = [selectorPrefix || '', EDITOR(filename)].join(' ');
        const line = `${editor} .view-lines > .view-line:nth-child(${lineNumber})`;
        const textarea = `${editor} textarea`;
        await this.code.waitAndClick(line, 1, 1);
        await this.code.waitForActiveElement(textarea);
    }
    async waitForTypeInEditor(filename, text, selectorPrefix = '') {
        if (text.includes('\n')) {
            throw new Error('waitForTypeInEditor does not support new lines, use either a long single line or dispatchKeybinding(\'Enter\')');
        }
        const editor = [selectorPrefix || '', EDITOR(filename)].join(' ');
        await this.code.waitForElement(editor);
        const textarea = `${editor} textarea`;
        await this.code.waitForActiveElement(textarea);
        await this.code.waitForTypeInEditor(textarea, text);
        await this.waitForEditorContents(filename, c => c.indexOf(text) > -1, selectorPrefix);
    }
    async waitForEditorContents(filename, accept, selectorPrefix = '') {
        const selector = [selectorPrefix || '', `${EDITOR(filename)} .view-lines`].join(' ');
        return this.code.waitForTextContent(selector, undefined, c => accept(c.replace(/\u00a0/g, ' ')));
    }
    async getClassSelectors(filename, term, viewline) {
        const elements = await this.code.waitForElements(`${VIEW_LINES(filename)}>:nth-child(${viewline}) span span`, false, els => els.some(el => el.textContent === term));
        const { className } = elements.filter(r => r.textContent === term)[0];
        return className.split(/\s/g);
    }
    async getViewLineIndex(filename, line) {
        const elements = await this.code.waitForElements(LINE_NUMBERS(filename), false, els => {
            return els.some(el => el.textContent === `${line}`);
        });
        for (let index = 0; index < elements.length; index++) {
            if (elements[index].textContent === `${line}`) {
                return index + 1;
            }
        }
        throw new Error('Line not found');
    }
}
exports.Editor = Editor;
Editor.FOLDING_EXPANDED = '.monaco-editor .margin .margin-view-overlays>:nth-child(${INDEX}) .folding';
Editor.FOLDING_COLLAPSED = `${Editor.FOLDING_EXPANDED}.collapsed`;
//# sourceMappingURL=editor.js.map