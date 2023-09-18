import { Workbench } from './workbench';
import { Code, LaunchOptions } from './code';
import { Logger } from './logger';
export declare const enum Quality {
    Dev = 0,
    Insiders = 1,
    Stable = 2,
    Exploration = 3,
    OSS = 4
}
export interface ApplicationOptions extends LaunchOptions {
    quality: Quality;
    readonly workspacePath: string;
}
export declare class Application {
    private options;
    constructor(options: ApplicationOptions);
    private _code;
    get code(): Code;
    private _workbench;
    get workbench(): Workbench;
    get quality(): Quality;
    get logger(): Logger;
    get remote(): boolean;
    get web(): boolean;
    private _workspacePathOrFolder;
    get workspacePathOrFolder(): string;
    get extensionsPath(): string;
    private _userDataPath;
    get userDataPath(): string;
    start(): Promise<void>;
    restart(options?: {
        workspaceOrFolder?: string;
        extraArgs?: string[];
    }): Promise<void>;
    private _start;
    stop(): Promise<void>;
    startTracing(name: string): Promise<void>;
    stopTracing(name: string, persist: boolean): Promise<void>;
    private startApplication;
    private checkWindowReady;
}
