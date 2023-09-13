import { Viewlet } from './viewlet';
import { Code } from './code';
import { Commands } from './workbench';
export declare class Extensions extends Viewlet {
    private commands;
    constructor(code: Code, commands: Commands);
    searchForExtension(id: string): Promise<any>;
    openExtension(id: string): Promise<any>;
    closeExtension(title: string): Promise<any>;
    installExtension(id: string, waitUntilEnabled: boolean): Promise<void>;
}
export declare function copyExtension(repoPath: string, extensionsPath: string, extId: string): Promise<void>;
