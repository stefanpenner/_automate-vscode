import { Explorer } from './explorer';
import { ActivityBar } from './activityBar';
import { QuickAccess } from './quickaccess';
import { QuickInput } from './quickinput';
import { Extensions } from './extensions';
import { Search } from './search';
import { Editor } from './editor';
import { SCM } from './scm';
import { Debug } from './debug';
import { StatusBar } from './statusbar';
import { Problems } from './problems';
import { SettingsEditor } from './settings';
import { KeybindingsEditor } from './keybindings';
import { Editors } from './editors';
import { Code } from './code';
import { Terminal } from './terminal';
import { Notebook } from './notebook';
import { Localization } from './localization';
import { Task } from './task';
export interface Commands {
    runCommand(command: string): Promise<any>;
}
export declare class Workbench {
    readonly quickaccess: QuickAccess;
    readonly quickinput: QuickInput;
    readonly editors: Editors;
    readonly explorer: Explorer;
    readonly activitybar: ActivityBar;
    readonly search: Search;
    readonly extensions: Extensions;
    readonly editor: Editor;
    readonly scm: SCM;
    readonly debug: Debug;
    readonly statusbar: StatusBar;
    readonly problems: Problems;
    readonly settingsEditor: SettingsEditor;
    readonly keybindingsEditor: KeybindingsEditor;
    readonly terminal: Terminal;
    readonly notebook: Notebook;
    readonly localization: Localization;
    readonly task: Task;
    constructor(code: Code);
}
