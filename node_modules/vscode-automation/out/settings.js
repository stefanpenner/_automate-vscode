"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsEditor = void 0;
const SEARCH_BOX = '.settings-editor .suggest-input-container .monaco-editor textarea';
class SettingsEditor {
    constructor(code, editors, editor, quickaccess) {
        this.code = code;
        this.editors = editors;
        this.editor = editor;
        this.quickaccess = quickaccess;
    }
    /**
     * Write a single setting key value pair.
     *
     * Warning: You may need to set `editor.wordWrap` to `"on"` if this is called with a really long
     * setting.
     */
    async addUserSetting(setting, value) {
        await this.openUserSettingsFile();
        await this.code.dispatchKeybinding('right');
        await this.editor.waitForTypeInEditor('settings.json', `"${setting}": ${value},`);
        await this.editors.saveOpenedFile();
    }
    /**
     * Write several settings faster than multiple calls to {@link addUserSetting}.
     *
     * Warning: You will likely also need to set `editor.wordWrap` to `"on"` if `addUserSetting` is
     * called after this in the test.
     */
    async addUserSettings(settings) {
        await this.openUserSettingsFile();
        await this.code.dispatchKeybinding('right');
        await this.editor.waitForTypeInEditor('settings.json', settings.map(v => `"${v[0]}": ${v[1]},`).join(''));
        await this.editors.saveOpenedFile();
    }
    async clearUserSettings() {
        await this.openUserSettingsFile();
        await this.quickaccess.runCommand('editor.action.selectAll');
        await this.code.dispatchKeybinding('Delete');
        await this.editor.waitForTypeInEditor('settings.json', `{`); // will auto close }
        await this.editors.saveOpenedFile();
        await this.quickaccess.runCommand('workbench.action.closeActiveEditor');
    }
    async openUserSettingsFile() {
        await this.quickaccess.runCommand('workbench.action.openSettingsJson');
        await this.editor.waitForEditorFocus('settings.json', 1);
    }
    async openUserSettingsUI() {
        await this.quickaccess.runCommand('workbench.action.openSettings2');
        await this.code.waitForActiveElement(SEARCH_BOX);
    }
    async searchSettingsUI(query) {
        await this.openUserSettingsUI();
        await this.code.waitAndClick(SEARCH_BOX);
        if (process.platform === 'darwin') {
            await this.code.dispatchKeybinding('cmd+a');
        }
        else {
            await this.code.dispatchKeybinding('ctrl+a');
        }
        await this.code.dispatchKeybinding('Delete');
        await this.code.waitForElements('.settings-editor .settings-count-widget', false, results => !results || (results?.length === 1 && !results[0].textContent));
        await this.code.waitForTypeInEditor('.settings-editor .suggest-input-container .monaco-editor textarea', query);
        await this.code.waitForElements('.settings-editor .settings-count-widget', false, results => results?.length === 1 && results[0].textContent.includes('Found'));
    }
}
exports.SettingsEditor = SettingsEditor;
//# sourceMappingURL=settings.js.map