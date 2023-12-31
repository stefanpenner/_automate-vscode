"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeybindingsEditor = void 0;
const SEARCH_INPUT = '.keybindings-header .settings-search-input input';
class KeybindingsEditor {
    constructor(code) {
        this.code = code;
    }
    async updateKeybinding(command, commandName, keybinding, keybindingTitle) {
        if (process.platform === 'darwin') {
            await this.code.dispatchKeybinding('cmd+k cmd+s');
        }
        else {
            await this.code.dispatchKeybinding('ctrl+k ctrl+s');
        }
        await this.code.waitForActiveElement(SEARCH_INPUT);
        await this.code.waitForSetValue(SEARCH_INPUT, `@command:${command}`);
        const commandTitle = commandName ? `${commandName} (${command})` : command;
        await this.code.waitAndClick(`.keybindings-table-container .monaco-list-row .command[title="${commandTitle}"]`);
        await this.code.waitForElement(`.keybindings-table-container .monaco-list-row.focused.selected .command[title="${commandTitle}"]`);
        await this.code.dispatchKeybinding('enter');
        await this.code.waitForActiveElement('.defineKeybindingWidget .monaco-inputbox input');
        await this.code.dispatchKeybinding(keybinding);
        await this.code.dispatchKeybinding('enter');
        await this.code.waitForElement(`.keybindings-table-container .keybinding-label div[title="${keybindingTitle}"]`);
    }
}
exports.KeybindingsEditor = KeybindingsEditor;
//# sourceMappingURL=keybindings.js.map