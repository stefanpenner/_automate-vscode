"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskCommandId = void 0;
var TaskCommandId;
(function (TaskCommandId) {
    TaskCommandId["TerminalRename"] = "workbench.action.terminal.rename";
})(TaskCommandId || (exports.TaskCommandId = TaskCommandId = {}));
class Task {
    constructor(code, editor, editors, quickaccess, quickinput, terminal) {
        this.code = code;
        this.editor = editor;
        this.editors = editors;
        this.quickaccess = quickaccess;
        this.quickinput = quickinput;
        this.terminal = terminal;
    }
    async assertTasks(filter, expected, type) {
        await this.code.dispatchKeybinding('right');
        await this.editors.saveOpenedFile();
        type === 'run' ? await this.quickaccess.runCommand('workbench.action.tasks.runTask', true) : await this.quickaccess.runCommand('workbench.action.tasks.configureTask', true);
        if (expected.length === 0) {
            await this.quickinput.waitForQuickInputElements(e => e.length > 1 && e.every(label => label.trim() !== filter.trim()));
        }
        else {
            await this.quickinput.waitForQuickInputElements(e => e.length > 1 && e.some(label => label.trim() === filter.trim()));
        }
        if (expected.length > 0 && !expected[0].hide) {
            // select the expected task
            await this.quickinput.selectQuickInputElement(0, true);
            // Continue without scanning the output
            await this.quickinput.selectQuickInputElement(0);
            if (expected[0].icon) {
                await this.terminal.assertSingleTab({ color: expected[0].icon.color, icon: expected[0].icon.id || 'tools' });
            }
        }
        await this.quickinput.closeQuickInput();
    }
    async configureTask(properties) {
        await this.quickaccess.openFileQuickAccessAndWait('tasks.json', 'tasks.json');
        await this.quickinput.selectQuickInputElement(0);
        await this.quickaccess.runCommand('editor.action.selectAll');
        await this.code.dispatchKeybinding('Delete');
        const taskStringLines = [
            '{',
            '"version": "2.0.0",',
            '"tasks": [{' // Brackets auto close
        ];
        for (let [key, value] of Object.entries(properties)) {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            else if (typeof value === 'boolean') {
                value = value;
            }
            else if (typeof value === 'string') {
                value = `"${value}"`;
            }
            else {
                throw new Error('Unsupported task property value type');
            }
            taskStringLines.push(`"${key}": ${value},`);
        }
        for (const [i, line] of taskStringLines.entries()) {
            await this.editor.waitForTypeInEditor('tasks.json', `${line}`);
            if (i !== taskStringLines.length - 1) {
                await this.code.dispatchKeybinding('Enter');
            }
        }
        await this.editors.saveOpenedFile();
    }
}
exports.Task = Task;
//# sourceMappingURL=task.js.map