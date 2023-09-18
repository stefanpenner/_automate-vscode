"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
const viewlet_1 = require("./viewlet");
const code_1 = require("./code");
const VIEWLET = 'div[id="workbench.view.debug"]';
const DEBUG_VIEW = `${VIEWLET}`;
const CONFIGURE = `div[id="workbench.parts.sidebar"] .actions-container .codicon-gear`;
const STOP = `.debug-toolbar .action-label[title*="Stop"]`;
const STEP_OVER = `.debug-toolbar .action-label[title*="Step Over"]`;
const STEP_IN = `.debug-toolbar .action-label[title*="Step Into"]`;
const STEP_OUT = `.debug-toolbar .action-label[title*="Step Out"]`;
const CONTINUE = `.debug-toolbar .action-label[title*="Continue"]`;
const GLYPH_AREA = '.margin-view-overlays>:nth-child';
const BREAKPOINT_GLYPH = '.codicon-debug-breakpoint';
const PAUSE = `.debug-toolbar .action-label[title*="Pause"]`;
const DEBUG_STATUS_BAR = `.statusbar.debugging`;
const NOT_DEBUG_STATUS_BAR = `.statusbar:not(debugging)`;
const TOOLBAR_HIDDEN = `.debug-toolbar[aria-hidden="true"]`;
const STACK_FRAME = `${VIEWLET} .monaco-list-row .stack-frame`;
const SPECIFIC_STACK_FRAME = (filename) => `${STACK_FRAME} .file[title*="${filename}"]`;
const VARIABLE = `${VIEWLET} .debug-variables .monaco-list-row .expression`;
const CONSOLE_OUTPUT = `.repl .output.expression .value`;
const CONSOLE_EVALUATION_RESULT = `.repl .evaluation-result.expression .value`;
const CONSOLE_LINK = `.repl .value a.link`;
const REPL_FOCUSED = '.repl-input-wrapper .monaco-editor textarea';
function toStackFrame(element) {
    const name = (0, code_1.findElement)(element, e => /\bfile-name\b/.test(e.className));
    const line = (0, code_1.findElement)(element, e => /\bline-number\b/.test(e.className));
    const lineNumber = line.textContent ? parseInt(line.textContent.split(':').shift() || '0') : 0;
    return {
        name: name.textContent || '',
        lineNumber
    };
}
class Debug extends viewlet_1.Viewlet {
    constructor(code, commands, editors, editor) {
        super(code);
        this.commands = commands;
        this.editors = editors;
        this.editor = editor;
    }
    async openDebugViewlet() {
        if (process.platform === 'darwin') {
            await this.code.dispatchKeybinding('cmd+shift+d');
        }
        else {
            await this.code.dispatchKeybinding('ctrl+shift+d');
        }
        await this.code.waitForElement(DEBUG_VIEW);
    }
    async configure() {
        await this.code.waitAndClick(CONFIGURE);
        await this.editors.waitForEditorFocus('launch.json');
    }
    async setBreakpointOnLine(lineNumber) {
        await this.code.waitForElement(`${GLYPH_AREA}(${lineNumber})`);
        await this.code.waitAndClick(`${GLYPH_AREA}(${lineNumber})`, 5, 5);
        await this.code.waitForElement(BREAKPOINT_GLYPH);
    }
    async startDebugging() {
        await this.code.dispatchKeybinding('f5');
        await this.code.waitForElement(PAUSE);
        await this.code.waitForElement(DEBUG_STATUS_BAR);
        const portPrefix = 'Port: ';
        const output = await this.waitForOutput(output => output.some(line => line.indexOf(portPrefix) >= 0));
        const lastOutput = output.filter(line => line.indexOf(portPrefix) >= 0)[0];
        return lastOutput ? parseInt(lastOutput.substr(portPrefix.length)) : 3000;
    }
    async stepOver() {
        await this.code.waitAndClick(STEP_OVER);
    }
    async stepIn() {
        await this.code.waitAndClick(STEP_IN);
    }
    async stepOut() {
        await this.code.waitAndClick(STEP_OUT);
    }
    async continue() {
        await this.code.waitAndClick(CONTINUE);
        await this.waitForStackFrameLength(0);
    }
    async stopDebugging() {
        await this.code.waitAndClick(STOP);
        await this.code.waitForElement(TOOLBAR_HIDDEN);
        await this.code.waitForElement(NOT_DEBUG_STATUS_BAR);
    }
    async waitForStackFrame(func, message) {
        const elements = await this.code.waitForElements(STACK_FRAME, true, elements => elements.some(e => func(toStackFrame(e))));
        return elements.map(toStackFrame).filter(s => func(s))[0];
    }
    async waitForStackFrameLength(length) {
        await this.code.waitForElements(STACK_FRAME, false, result => result.length === length);
    }
    async focusStackFrame(name, message) {
        await this.code.waitAndClick(SPECIFIC_STACK_FRAME(name), 0, 0);
        await this.editors.waitForTab(name);
    }
    async waitForReplCommand(text, accept) {
        await this.commands.runCommand('Debug: Focus on Debug Console View');
        await this.code.waitForActiveElement(REPL_FOCUSED);
        await this.code.waitForSetValue(REPL_FOCUSED, text);
        // Wait for the keys to be picked up by the editor model such that repl evaluates what just got typed
        await this.editor.waitForEditorContents('debug:replinput', s => s.indexOf(text) >= 0);
        await this.code.dispatchKeybinding('enter');
        await this.code.waitForElements(CONSOLE_EVALUATION_RESULT, false, elements => !!elements.length && accept(elements[elements.length - 1].textContent));
    }
    // Different node versions give different number of variables. As a workaround be more relaxed when checking for variable count
    async waitForVariableCount(count, alternativeCount) {
        await this.code.waitForElements(VARIABLE, false, els => els.length === count || els.length === alternativeCount);
    }
    async waitForLink() {
        await this.code.waitForElement(CONSOLE_LINK);
    }
    async waitForOutput(fn) {
        const elements = await this.code.waitForElements(CONSOLE_OUTPUT, false, elements => fn(elements.map(e => e.textContent)));
        return elements.map(e => e.textContent);
    }
}
exports.Debug = Debug;
//# sourceMappingURL=debug.js.map