import { Editor } from './editor';
import { Code } from './code';
import { QuickAccess } from './quickaccess';
import { Editors } from './editors';
import { QuickInput } from './quickinput';
import { Terminal } from './terminal';
interface ITaskConfigurationProperties {
    label?: string;
    type?: string;
    command?: string;
    identifier?: string;
    group?: string;
    isBackground?: boolean;
    promptOnClose?: boolean;
    icon?: {
        id?: string;
        color?: string;
    };
    hide?: boolean;
}
export declare enum TaskCommandId {
    TerminalRename = "workbench.action.terminal.rename"
}
export declare class Task {
    private code;
    private editor;
    private editors;
    private quickaccess;
    private quickinput;
    private terminal;
    constructor(code: Code, editor: Editor, editors: Editors, quickaccess: QuickAccess, quickinput: QuickInput, terminal: Terminal);
    assertTasks(filter: string, expected: ITaskConfigurationProperties[], type: 'run' | 'configure'): Promise<void>;
    configureTask(properties: ITaskConfigurationProperties): Promise<void>;
}
export {};
