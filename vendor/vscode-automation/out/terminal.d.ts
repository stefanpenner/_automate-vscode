import { QuickInput } from './quickinput';
import { Code } from './code';
import { QuickAccess } from './quickaccess';
export declare enum Selector {
    TerminalView = "#terminal",
    CommandDecorationPlaceholder = ".terminal-command-decoration.codicon-terminal-decoration-incomplete",
    CommandDecorationSuccess = ".terminal-command-decoration.codicon-terminal-decoration-success",
    CommandDecorationError = ".terminal-command-decoration.codicon-terminal-decoration-error",
    Xterm = "#terminal .terminal-wrapper",
    XtermEditor = ".editor-instance .terminal-wrapper",
    TabsEntry = ".terminal-tabs-entry",
    Description = ".label-description",
    XtermFocused = ".terminal.xterm.focus",
    PlusButton = ".codicon-plus",
    EditorGroups = ".editor .split-view-view",
    EditorTab = ".terminal-tab",
    SingleTab = ".single-terminal-tab",
    Tabs = ".tabs-list .monaco-list-row",
    SplitButton = ".editor .codicon-split-horizontal",
    XtermSplitIndex0 = "#terminal .terminal-groups-container .split-view-view:nth-child(1) .terminal-wrapper",
    XtermSplitIndex1 = "#terminal .terminal-groups-container .split-view-view:nth-child(2) .terminal-wrapper",
    Hide = ".hide"
}
/**
 * Terminal commands that accept a value in a quick input.
 */
export declare enum TerminalCommandIdWithValue {
    Rename = "workbench.action.terminal.rename",
    ChangeColor = "workbench.action.terminal.changeColor",
    ChangeIcon = "workbench.action.terminal.changeIcon",
    NewWithProfile = "workbench.action.terminal.newWithProfile",
    SelectDefaultProfile = "workbench.action.terminal.selectDefaultShell",
    AttachToSession = "workbench.action.terminal.attachToSession",
    WriteDataToTerminal = "workbench.action.terminal.writeDataToTerminal"
}
/**
 * Terminal commands that do not present a quick input.
 */
export declare enum TerminalCommandId {
    Split = "workbench.action.terminal.split",
    KillAll = "workbench.action.terminal.killAll",
    Unsplit = "workbench.action.terminal.unsplit",
    Join = "workbench.action.terminal.join",
    Show = "workbench.action.terminal.toggleTerminal",
    CreateNewEditor = "workbench.action.createTerminalEditor",
    SplitEditor = "workbench.action.createTerminalEditorSide",
    MoveToPanel = "workbench.action.terminal.moveToTerminalPanel",
    MoveToEditor = "workbench.action.terminal.moveToEditor",
    NewWithProfile = "workbench.action.terminal.newWithProfile",
    SelectDefaultProfile = "workbench.action.terminal.selectDefaultShell",
    DetachSession = "workbench.action.terminal.detachSession",
    CreateNew = "workbench.action.terminal.new"
}
interface TerminalLabel {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
}
type TerminalGroup = TerminalLabel[];
interface ICommandDecorationCounts {
    placeholder: number;
    success: number;
    error: number;
}
export declare class Terminal {
    private code;
    private quickaccess;
    private quickinput;
    constructor(code: Code, quickaccess: QuickAccess, quickinput: QuickInput);
    runCommand(commandId: TerminalCommandId, expectedLocation?: 'editor' | 'panel'): Promise<void>;
    runCommandWithValue(commandId: TerminalCommandIdWithValue, value?: string, altKey?: boolean): Promise<void>;
    runCommandInTerminal(commandText: string, skipEnter?: boolean): Promise<void>;
    /**
     * Creates a terminal using the new terminal command.
     * @param expectedLocation The location to check the terminal for, defaults to panel.
     */
    createTerminal(expectedLocation?: 'editor' | 'panel'): Promise<void>;
    assertEditorGroupCount(count: number): Promise<void>;
    assertSingleTab(label: TerminalLabel, editor?: boolean): Promise<void>;
    assertTerminalGroups(expectedGroups: TerminalGroup[]): Promise<void>;
    getTerminalGroups(): Promise<TerminalGroup[]>;
    getSingleTabName(): Promise<string>;
    private assertTabExpected;
    assertTerminalViewHidden(): Promise<void>;
    assertCommandDecorations(expectedCounts?: ICommandDecorationCounts, customIcon?: {
        updatedIcon: string;
        count: number;
    }, showDecorations?: 'both' | 'gutter' | 'overviewRuler' | 'never'): Promise<void>;
    clickPlusButton(): Promise<void>;
    clickSplitButton(): Promise<void>;
    clickSingleTab(): Promise<void>;
    waitForTerminalText(accept: (buffer: string[]) => boolean, message?: string, splitIndex?: 0 | 1): Promise<void>;
    getPage(): Promise<any>;
    /**
     * Waits for the terminal to be focused and to contain content.
     * @param expectedLocation The location to check the terminal for, defaults to panel.
     */
    private _waitForTerminal;
}
export {};
