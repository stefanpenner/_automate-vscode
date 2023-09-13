"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problems = void 0;
class Problems {
    constructor(code, quickAccess) {
        this.code = code;
        this.quickAccess = quickAccess;
    }
    async showProblemsView() {
        await this.quickAccess.runCommand('workbench.panel.markers.view.focus');
        await this.waitForProblemsView();
    }
    async hideProblemsView() {
        await this.quickAccess.runCommand('workbench.actions.view.problems');
        await this.code.waitForElement(Problems.PROBLEMS_VIEW_SELECTOR, el => !el);
    }
    async waitForProblemsView() {
        await this.code.waitForElement(Problems.PROBLEMS_VIEW_SELECTOR);
    }
    static getSelectorInProblemsView(problemType) {
        const selector = problemType === 0 /* ProblemSeverity.WARNING */ ? 'codicon-warning' : 'codicon-error';
        return `div[id="workbench.panel.markers"] .monaco-tl-contents .marker-icon .${selector}`;
    }
    static getSelectorInEditor(problemType) {
        const selector = problemType === 0 /* ProblemSeverity.WARNING */ ? 'squiggly-warning' : 'squiggly-error';
        return `.view-overlays .cdr.${selector}`;
    }
}
exports.Problems = Problems;
Problems.PROBLEMS_VIEW_SELECTOR = '.panel .markers-panel';
//# sourceMappingURL=problems.js.map