"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workbench = void 0;
const explorer_1 = require("./explorer");
const activityBar_1 = require("./activityBar");
const quickaccess_1 = require("./quickaccess");
const quickinput_1 = require("./quickinput");
const extensions_1 = require("./extensions");
const search_1 = require("./search");
const editor_1 = require("./editor");
const scm_1 = require("./scm");
const debug_1 = require("./debug");
const statusbar_1 = require("./statusbar");
const problems_1 = require("./problems");
const settings_1 = require("./settings");
const keybindings_1 = require("./keybindings");
const editors_1 = require("./editors");
const terminal_1 = require("./terminal");
const notebook_1 = require("./notebook");
const localization_1 = require("./localization");
const task_1 = require("./task");
class Workbench {
    constructor(code) {
        this.editors = new editors_1.Editors(code);
        this.quickinput = new quickinput_1.QuickInput(code);
        this.quickaccess = new quickaccess_1.QuickAccess(code, this.editors, this.quickinput);
        this.explorer = new explorer_1.Explorer(code);
        this.activitybar = new activityBar_1.ActivityBar(code);
        this.search = new search_1.Search(code);
        this.extensions = new extensions_1.Extensions(code, this.quickaccess);
        this.editor = new editor_1.Editor(code, this.quickaccess);
        this.scm = new scm_1.SCM(code);
        this.debug = new debug_1.Debug(code, this.quickaccess, this.editors, this.editor);
        this.statusbar = new statusbar_1.StatusBar(code);
        this.problems = new problems_1.Problems(code, this.quickaccess);
        this.settingsEditor = new settings_1.SettingsEditor(code, this.editors, this.editor, this.quickaccess);
        this.keybindingsEditor = new keybindings_1.KeybindingsEditor(code);
        this.terminal = new terminal_1.Terminal(code, this.quickaccess, this.quickinput);
        this.notebook = new notebook_1.Notebook(this.quickaccess, this.quickinput, code);
        this.localization = new localization_1.Localization(code);
        this.task = new task_1.Task(code, this.editor, this.editors, this.quickaccess, this.quickinput, this.terminal);
    }
}
exports.Workbench = Workbench;
//# sourceMappingURL=workbench.js.map