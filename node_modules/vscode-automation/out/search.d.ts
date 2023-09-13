import { Viewlet } from './viewlet';
import { Code } from './code';
export declare class Search extends Viewlet {
    constructor(code: Code);
    clearSearchResults(): Promise<void>;
    openSearchViewlet(): Promise<any>;
    getSearchTooltip(): Promise<any>;
    searchFor(text: string): Promise<void>;
    submitSearch(): Promise<void>;
    setFilesToIncludeText(text: string): Promise<void>;
    showQueryDetails(): Promise<void>;
    hideQueryDetails(): Promise<void>;
    removeFileMatch(filename: string, expectedText: string): Promise<void>;
    expandReplace(): Promise<void>;
    collapseReplace(): Promise<void>;
    setReplaceText(text: string): Promise<void>;
    replaceFileMatch(filename: string, expectedText: string): Promise<void>;
    waitForResultText(text: string, retryCount?: number): Promise<void>;
    waitForNoResultText(retryCount?: number): Promise<void>;
    private waitForInputFocus;
}
