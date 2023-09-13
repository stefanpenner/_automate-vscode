"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Editors = void 0;
class Editors {
  constructor(code) {
    this.code = code;
  }
  async saveOpenedFile() {
    if (process.platform === 'darwin') {
      await this.code.dispatchKeybinding('cmd+s');
    }
    else {
      await this.code.dispatchKeybinding('ctrl+s');
    }
  }
  async selectTab(fileName) {
    // Selecting a tab and making an editor have keyboard focus
    // is critical to almost every test. As such, we try our
    // best to retry this task in case some other component steals
    // focus away from the editor while we attempt to get focus
    let error = undefined;
    let retries = 0;
    while (retries < 10) {
      await this.code.waitAndClick(`.tabs-container div.tab[data-resource-name$="${fileName}"]`);
      await this.code.dispatchKeybinding(process.platform === 'darwin' ? 'cmd+1' : 'ctrl+1'); // make editor really active if click failed somehow
      try {
        await this.waitForEditorFocus(fileName, 50 /* 50 retries * 100ms delay = 5s */);
        return;
      }
      catch (e) {
        error = e;
        retries++;
      }
    }
    // We failed after 10 retries
    throw error;
  }
  async waitForEditorFocus(fileName, retryCount) {
    await this.waitForActiveTab(fileName, undefined, retryCount);
    await this.waitForActiveEditor(fileName, retryCount);
  }
  async waitForActiveTab(fileName, isDirty = false, retryCount) {
    await this.code.waitForElement(`.tabs-container div.tab.active${isDirty ? '.dirty' : ''}[aria-selected="true"][data-resource-name$="${fileName}"]`, undefined, retryCount);
  }
  async waitForActiveEditor(fileName, retryCount) {
    const selector = `.editor-instance .monaco-editor[data-uri$="${fileName}"] textarea`;
    return this.code.waitForActiveElement(selector, retryCount);
  }
  async waitForTab(fileName, isDirty = false) {
    await this.code.waitForElement(`.tabs-container div.tab${isDirty ? '.dirty' : ''}[data-resource-name$="${fileName}"]`);
  }
  async newUntitledFile() {
    if (process.platform === 'darwin') {
      await this.code.dispatchKeybinding('cmd+n');
    }
    else {
      await this.code.dispatchKeybinding('ctrl+n');
    }
    await this.waitForEditorFocus('Untitled-1');
  }
}
exports.Editors = Editors;
//# sourceMappingURL=editors.js.map
