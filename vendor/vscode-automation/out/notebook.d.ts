import { Code } from './code';
import { QuickAccess } from './quickaccess';
import { QuickInput } from './quickinput';
export declare class Notebook {
    private readonly quickAccess;
    private readonly quickInput;
    private readonly code;
    constructor(quickAccess: QuickAccess, quickInput: QuickInput, code: Code);
    openNotebook(): Promise<void>;
    focusNextCell(): Promise<void>;
    focusFirstCell(): Promise<void>;
    editCell(): Promise<void>;
    stopEditingCell(): Promise<void>;
    waitForTypeInEditor(text: string): Promise<any>;
    waitForActiveCellEditorContents(contents: string): Promise<any>;
    private _waitForActiveCellEditorContents;
    waitForMarkdownContents(markdownSelector: string, text: string): Promise<void>;
    insertNotebookCell(kind: 'markdown' | 'code'): Promise<void>;
    deleteActiveCell(): Promise<void>;
    focusInCellOutput(): Promise<void>;
    focusOutCellOutput(): Promise<void>;
    executeActiveCell(): Promise<void>;
    executeCellAction(selector: string): Promise<void>;
}
