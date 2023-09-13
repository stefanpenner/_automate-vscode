"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCM = void 0;
const viewlet_1 = require("./viewlet");
const code_1 = require("./code");
const VIEWLET = 'div[id="workbench.view.scm"]';
const SCM_INPUT = `${VIEWLET} .scm-editor textarea`;
const SCM_RESOURCE = `${VIEWLET} .monaco-list-row .resource`;
const REFRESH_COMMAND = `div[id="workbench.parts.sidebar"] .actions-container a.action-label[title="Refresh"]`;
const COMMIT_COMMAND = `div[id="workbench.parts.sidebar"] .actions-container a.action-label[title="Commit"]`;
const SCM_RESOURCE_CLICK = (name) => `${SCM_RESOURCE} .monaco-icon-label[title*="${name}"] .label-name`;
const SCM_RESOURCE_ACTION_CLICK = (name, actionName) => `${SCM_RESOURCE} .monaco-icon-label[title*="${name}"] .actions .action-label[title="${actionName}"]`;
function toChange(element) {
    const name = (0, code_1.findElement)(element, e => /\blabel-name\b/.test(e.className));
    const type = element.attributes['data-tooltip'] || '';
    const actionElementList = (0, code_1.findElements)(element, e => /\baction-label\b/.test(e.className));
    const actions = actionElementList.map(e => e.attributes['title']);
    return {
        name: name.textContent || '',
        type,
        actions
    };
}
class SCM extends viewlet_1.Viewlet {
    constructor(code) {
        super(code);
    }
    async openSCMViewlet() {
        await this.code.dispatchKeybinding('ctrl+shift+g');
        await this.code.waitForElement(SCM_INPUT);
    }
    async waitForChange(name, type) {
        const func = (change) => change.name === name && (!type || change.type === type);
        await this.code.waitForElements(SCM_RESOURCE, true, elements => elements.some(e => func(toChange(e))));
    }
    async refreshSCMViewlet() {
        await this.code.waitAndClick(REFRESH_COMMAND);
    }
    async openChange(name) {
        await this.code.waitAndClick(SCM_RESOURCE_CLICK(name));
    }
    async stage(name) {
        await this.code.waitAndClick(SCM_RESOURCE_ACTION_CLICK(name, 'Stage Changes'));
        await this.waitForChange(name, 'Index Modified');
    }
    async unstage(name) {
        await this.code.waitAndClick(SCM_RESOURCE_ACTION_CLICK(name, 'Unstage Changes'));
        await this.waitForChange(name, 'Modified');
    }
    async commit(message) {
        await this.code.waitAndClick(SCM_INPUT);
        await this.code.waitForActiveElement(SCM_INPUT);
        await this.code.waitForSetValue(SCM_INPUT, message);
        await this.code.waitAndClick(COMMIT_COMMAND);
    }
}
exports.SCM = SCM;
//# sourceMappingURL=scm.js.map