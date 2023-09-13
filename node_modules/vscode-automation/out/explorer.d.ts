import { Viewlet } from './viewlet';
import { Code } from './code';
export declare class Explorer extends Viewlet {
    private static readonly EXPLORER_VIEWLET;
    private static readonly OPEN_EDITORS_VIEW;
    constructor(code: Code);
    openExplorerView(): Promise<any>;
    waitForOpenEditorsViewTitle(fn: (title: string) => boolean): Promise<void>;
    getExtensionSelector(fileName: string): string;
}
