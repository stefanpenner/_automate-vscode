import { Code } from './code';
export declare class Editors {
    private code;
    constructor(code: Code);
    saveOpenedFile(): Promise<any>;
    selectTab(fileName: string): Promise<void>;
    waitForEditorFocus(fileName: string, retryCount?: number): Promise<void>;
    waitForActiveTab(fileName: string, isDirty?: boolean, retryCount?: number): Promise<void>;
    waitForActiveEditor(fileName: string, retryCount?: number): Promise<any>;
    waitForTab(fileName: string, isDirty?: boolean): Promise<void>;
    newUntitledFile(): Promise<void>;
}
