"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = exports.TerminalCommandId = exports.TerminalCommandIdWithValue = exports.Selector = void 0;
var Selector;
(function (Selector) {
    Selector["TerminalView"] = "#terminal";
    Selector["CommandDecorationPlaceholder"] = ".terminal-command-decoration.codicon-terminal-decoration-incomplete";
    Selector["CommandDecorationSuccess"] = ".terminal-command-decoration.codicon-terminal-decoration-success";
    Selector["CommandDecorationError"] = ".terminal-command-decoration.codicon-terminal-decoration-error";
    Selector["Xterm"] = "#terminal .terminal-wrapper";
    Selector["XtermEditor"] = ".editor-instance .terminal-wrapper";
    Selector["TabsEntry"] = ".terminal-tabs-entry";
    Selector["Description"] = ".label-description";
    Selector["XtermFocused"] = ".terminal.xterm.focus";
    Selector["PlusButton"] = ".codicon-plus";
    Selector["EditorGroups"] = ".editor .split-view-view";
    Selector["EditorTab"] = ".terminal-tab";
    Selector["SingleTab"] = ".single-terminal-tab";
    Selector["Tabs"] = ".tabs-list .monaco-list-row";
    Selector["SplitButton"] = ".editor .codicon-split-horizontal";
    Selector["XtermSplitIndex0"] = "#terminal .terminal-groups-container .split-view-view:nth-child(1) .terminal-wrapper";
    Selector["XtermSplitIndex1"] = "#terminal .terminal-groups-container .split-view-view:nth-child(2) .terminal-wrapper";
    Selector["Hide"] = ".hide";
})(Selector || (exports.Selector = Selector = {}));
/**
 * Terminal commands that accept a value in a quick input.
 */
var TerminalCommandIdWithValue;
(function (TerminalCommandIdWithValue) {
    TerminalCommandIdWithValue["Rename"] = "workbench.action.terminal.rename";
    TerminalCommandIdWithValue["ChangeColor"] = "workbench.action.terminal.changeColor";
    TerminalCommandIdWithValue["ChangeIcon"] = "workbench.action.terminal.changeIcon";
    TerminalCommandIdWithValue["NewWithProfile"] = "workbench.action.terminal.newWithProfile";
    TerminalCommandIdWithValue["SelectDefaultProfile"] = "workbench.action.terminal.selectDefaultShell";
    TerminalCommandIdWithValue["AttachToSession"] = "workbench.action.terminal.attachToSession";
    TerminalCommandIdWithValue["WriteDataToTerminal"] = "workbench.action.terminal.writeDataToTerminal";
})(TerminalCommandIdWithValue || (exports.TerminalCommandIdWithValue = TerminalCommandIdWithValue = {}));
/**
 * Terminal commands that do not present a quick input.
 */
var TerminalCommandId;
(function (TerminalCommandId) {
    TerminalCommandId["Split"] = "workbench.action.terminal.split";
    TerminalCommandId["KillAll"] = "workbench.action.terminal.killAll";
    TerminalCommandId["Unsplit"] = "workbench.action.terminal.unsplit";
    TerminalCommandId["Join"] = "workbench.action.terminal.join";
    TerminalCommandId["Show"] = "workbench.action.terminal.toggleTerminal";
    TerminalCommandId["CreateNewEditor"] = "workbench.action.createTerminalEditor";
    TerminalCommandId["SplitEditor"] = "workbench.action.createTerminalEditorSide";
    TerminalCommandId["MoveToPanel"] = "workbench.action.terminal.moveToTerminalPanel";
    TerminalCommandId["MoveToEditor"] = "workbench.action.terminal.moveToEditor";
    TerminalCommandId["NewWithProfile"] = "workbench.action.terminal.newWithProfile";
    TerminalCommandId["SelectDefaultProfile"] = "workbench.action.terminal.selectDefaultShell";
    TerminalCommandId["DetachSession"] = "workbench.action.terminal.detachSession";
    TerminalCommandId["CreateNew"] = "workbench.action.terminal.new";
})(TerminalCommandId || (exports.TerminalCommandId = TerminalCommandId = {}));
class Terminal {
    constructor(code, quickaccess, quickinput) {
        this.code = code;
        this.quickaccess = quickaccess;
        this.quickinput = quickinput;
    }
    async runCommand(commandId, expectedLocation) {
        const keepOpen = commandId === TerminalCommandId.Join;
        await this.quickaccess.runCommand(commandId, keepOpen);
        if (keepOpen) {
            await this.code.dispatchKeybinding('enter');
            await this.quickinput.waitForQuickInputClosed();
        }
        switch (commandId) {
            case TerminalCommandId.Show:
            case TerminalCommandId.CreateNewEditor:
            case TerminalCommandId.CreateNew:
            case TerminalCommandId.NewWithProfile:
                await this._waitForTerminal(expectedLocation === 'editor' || commandId === TerminalCommandId.CreateNewEditor ? 'editor' : 'panel');
                break;
            case TerminalCommandId.KillAll:
                // HACK: Attempt to kill all terminals to clean things up, this is known to be flaky
                // but the reason why isn't known. This is typically called in the after each hook,
                // Since it's not actually required that all terminals are killed just continue on
                // after 2 seconds.
                await Promise.race([
                    this.code.waitForElements(Selector.Xterm, true, e => e.length === 0),
                    this.code.wait(2000)
                ]);
                break;
        }
    }
    async runCommandWithValue(commandId, value, altKey) {
        const shouldKeepOpen = !!value || commandId === TerminalCommandIdWithValue.NewWithProfile || commandId === TerminalCommandIdWithValue.Rename || (commandId === TerminalCommandIdWithValue.SelectDefaultProfile && value !== 'PowerShell');
        await this.quickaccess.runCommand(commandId, shouldKeepOpen);
        // Running the command should hide the quick input in the following frame, this next wait
        // ensures that the quick input is opened again before proceeding to avoid a race condition
        // where the enter keybinding below would close the quick input if it's triggered before the
        // new quick input shows.
        await this.quickinput.waitForQuickInputOpened();
        if (value) {
            await this.quickinput.type(value);
        }
        else if (commandId === TerminalCommandIdWithValue.Rename) {
            // Reset
            await this.code.dispatchKeybinding('Backspace');
        }
        await this.code.dispatchKeybinding(altKey ? 'Alt+Enter' : 'enter');
        await this.quickinput.waitForQuickInputClosed();
        if (commandId === TerminalCommandIdWithValue.NewWithProfile) {
            await this._waitForTerminal();
        }
    }
    async runCommandInTerminal(commandText, skipEnter) {
        await this.code.writeInTerminal(Selector.Xterm, commandText);
        if (!skipEnter) {
            await this.code.dispatchKeybinding('enter');
        }
    }
    /**
     * Creates a terminal using the new terminal command.
     * @param expectedLocation The location to check the terminal for, defaults to panel.
     */
    async createTerminal(expectedLocation) {
        await this.runCommand(TerminalCommandId.CreateNew, expectedLocation);
        await this._waitForTerminal(expectedLocation);
    }
    async assertEditorGroupCount(count) {
        await this.code.waitForElements(Selector.EditorGroups, true, editorGroups => editorGroups && editorGroups.length === count);
    }
    async assertSingleTab(label, editor) {
        let regex = undefined;
        if (label.name && label.description) {
            regex = new RegExp(label.name + ' - ' + label.description);
        }
        else if (label.name) {
            regex = new RegExp(label.name);
        }
        await this.assertTabExpected(editor ? Selector.EditorTab : Selector.SingleTab, undefined, regex, label.icon, label.color);
    }
    async assertTerminalGroups(expectedGroups) {
        let expectedCount = 0;
        expectedGroups.forEach(g => expectedCount += g.length);
        let index = 0;
        while (index < expectedCount) {
            for (let groupIndex = 0; groupIndex < expectedGroups.length; groupIndex++) {
                const terminalsInGroup = expectedGroups[groupIndex].length;
                let indexInGroup = 0;
                const isSplit = terminalsInGroup > 1;
                while (indexInGroup < terminalsInGroup) {
                    const instance = expectedGroups[groupIndex][indexInGroup];
                    const nameRegex = instance.name && isSplit ? new RegExp('\\s*[├┌└]\\s*' + instance.name) : instance.name ? new RegExp(/^\s*/ + instance.name) : undefined;
                    await this.assertTabExpected(undefined, index, nameRegex, instance.icon, instance.color, instance.description);
                    indexInGroup++;
                    index++;
                }
            }
        }
    }
    async getTerminalGroups() {
        const tabCount = (await this.code.waitForElements(Selector.Tabs, true)).length;
        const groups = [];
        for (let i = 0; i < tabCount; i++) {
            const title = await this.code.waitForElement(`${Selector.Tabs}[data-index="${i}"] ${Selector.TabsEntry}`, e => e?.textContent?.length ? e?.textContent?.length > 1 : false);
            const description = await this.code.waitForElement(`${Selector.Tabs}[data-index="${i}"] ${Selector.TabsEntry} ${Selector.Description}`, () => true);
            const label = {
                name: title.textContent.replace(/^[├┌└]\s*/, ''),
                description: description?.textContent
            };
            // It's a new group if the the tab does not start with ├ or └
            if (title.textContent.match(/^[├└]/)) {
                groups[groups.length - 1].push(label);
            }
            else {
                groups.push([label]);
            }
        }
        return groups;
    }
    async getSingleTabName() {
        const tab = await this.code.waitForElement(Selector.SingleTab, singleTab => !!singleTab && singleTab?.textContent.length > 1);
        return tab.textContent;
    }
    async assertTabExpected(selector, listIndex, nameRegex, icon, color, description) {
        if (listIndex) {
            if (nameRegex) {
                await this.code.waitForElement(`${Selector.Tabs}[data-index="${listIndex}"] ${Selector.TabsEntry}`, entry => !!entry && !!entry?.textContent.match(nameRegex));
                if (description) {
                    await this.code.waitForElement(`${Selector.Tabs}[data-index="${listIndex}"] ${Selector.TabsEntry} ${Selector.Description}`, e => !!e && e.textContent === description);
                }
            }
            if (color) {
                await this.code.waitForElement(`${Selector.Tabs}[data-index="${listIndex}"] ${Selector.TabsEntry} .monaco-icon-label.terminal-icon-terminal_ansi${color}`);
            }
            if (icon) {
                await this.code.waitForElement(`${Selector.Tabs}[data-index="${listIndex}"] ${Selector.TabsEntry} .codicon-${icon}`);
            }
        }
        else if (selector) {
            if (nameRegex) {
                await this.code.waitForElement(`${selector}`, singleTab => !!singleTab && !!singleTab?.textContent.match(nameRegex));
            }
            if (color) {
                await this.code.waitForElement(`${selector}`, singleTab => !!singleTab && !!singleTab.className.includes(`terminal-icon-terminal_ansi${color}`));
            }
            if (icon) {
                selector = selector === Selector.EditorTab ? selector : `${selector} .codicon`;
                await this.code.waitForElement(`${selector}`, singleTab => !!singleTab && !!singleTab.className.includes(icon));
            }
        }
    }
    async assertTerminalViewHidden() {
        await this.code.waitForElement(Selector.TerminalView, result => result === undefined);
    }
    async assertCommandDecorations(expectedCounts, customIcon, showDecorations) {
        if (expectedCounts) {
            const placeholderSelector = showDecorations === 'overviewRuler' ? `${Selector.CommandDecorationPlaceholder}${Selector.Hide}` : Selector.CommandDecorationPlaceholder;
            await this.code.waitForElements(placeholderSelector, true, decorations => decorations && decorations.length === expectedCounts.placeholder);
            const successSelector = showDecorations === 'overviewRuler' ? `${Selector.CommandDecorationSuccess}${Selector.Hide}` : Selector.CommandDecorationSuccess;
            await this.code.waitForElements(successSelector, true, decorations => decorations && decorations.length === expectedCounts.success);
            const errorSelector = showDecorations === 'overviewRuler' ? `${Selector.CommandDecorationError}${Selector.Hide}` : Selector.CommandDecorationError;
            await this.code.waitForElements(errorSelector, true, decorations => decorations && decorations.length === expectedCounts.error);
        }
        if (customIcon) {
            await this.code.waitForElements(`.terminal-command-decoration.codicon-${customIcon.updatedIcon}`, true, decorations => decorations && decorations.length === customIcon.count);
        }
    }
    async clickPlusButton() {
        await this.code.waitAndClick(Selector.PlusButton);
    }
    async clickSplitButton() {
        await this.code.waitAndClick(Selector.SplitButton);
    }
    async clickSingleTab() {
        await this.code.waitAndClick(Selector.SingleTab);
    }
    async waitForTerminalText(accept, message, splitIndex) {
        try {
            let selector = Selector.Xterm;
            if (splitIndex !== undefined) {
                selector = splitIndex === 0 ? Selector.XtermSplitIndex0 : Selector.XtermSplitIndex1;
            }
            await this.code.waitForTerminalBuffer(selector, accept);
        }
        catch (err) {
            if (message) {
                throw new Error(`${message} \n\nInner exception: \n${err.message} `);
            }
            throw err;
        }
    }
    async getPage() {
        return this.code.driver.page;
    }
    /**
     * Waits for the terminal to be focused and to contain content.
     * @param expectedLocation The location to check the terminal for, defaults to panel.
     */
    async _waitForTerminal(expectedLocation) {
        await this.code.waitForElement(Selector.XtermFocused);
        await this.code.waitForTerminalBuffer(expectedLocation === 'editor' ? Selector.XtermEditor : Selector.Xterm, lines => lines.some(line => line.length > 0));
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=terminal.js.map