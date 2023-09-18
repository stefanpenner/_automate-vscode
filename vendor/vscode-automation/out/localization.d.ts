import { Code } from './code';
import { ILocalizedStrings, ILocaleInfo } from './driver';
export declare class Localization {
    private code;
    constructor(code: Code);
    getLocaleInfo(): Promise<ILocaleInfo>;
    getLocalizedStrings(): Promise<ILocalizedStrings>;
}
