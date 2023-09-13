import { Code } from './code';
export declare class QuickInput {
    private code;
    private static QUICK_INPUT;
    private static QUICK_INPUT_INPUT;
    private static QUICK_INPUT_ROW;
    private static QUICK_INPUT_FOCUSED_ELEMENT;
    private static QUICK_INPUT_ENTRY_LABEL;
    private static QUICK_INPUT_ENTRY_LABEL_SPAN;
    constructor(code: Code);
    waitForQuickInputOpened(retryCount?: number): Promise<void>;
    type(value: string): Promise<void>;
    waitForQuickInputElementFocused(): Promise<void>;
    waitForQuickInputElementText(): Promise<string>;
    closeQuickInput(): Promise<void>;
    waitForQuickInputElements(accept: (names: string[]) => boolean): Promise<void>;
    waitForQuickInputClosed(): Promise<void>;
    selectQuickInputElement(index: number, keepOpen?: boolean): Promise<void>;
}
