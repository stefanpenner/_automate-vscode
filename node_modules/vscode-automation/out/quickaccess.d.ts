import { Editors } from './editors';
import { Code } from './code';
import { QuickInput } from './quickinput';
export declare class QuickAccess {
    private code;
    private editors;
    private quickInput;
    constructor(code: Code, editors: Editors, quickInput: QuickInput);
    openFileQuickAccessAndWait(searchValue: string, expectedFirstElementNameOrExpectedResultCount: string | number): Promise<void>;
    openFile(path: string): Promise<void>;
    private openQuickAccessWithRetry;
    runCommand(commandId: string, keepOpen?: boolean): Promise<void>;
    openQuickOutline(): Promise<void>;
}
