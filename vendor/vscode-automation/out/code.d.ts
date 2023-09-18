/// <reference types="node" />
import * as cp from 'child_process';
import { IElement, ILocaleInfo, ILocalizedStrings, ILogFile } from './driver';
import { Logger } from './logger';
import { PlaywrightDriver } from './playwrightDriver';
export interface LaunchOptions {
    codePath?: string;
    readonly workspacePath: string;
    userDataDir: string;
    readonly extensionsPath: string;
    readonly logger: Logger;
    logsPath: string;
    crashesPath: string;
    readonly verbose?: boolean;
    readonly extraArgs?: string[];
    readonly remote?: boolean;
    readonly web?: boolean;
    readonly tracing?: boolean;
    readonly headless?: boolean;
    readonly browser?: 'chromium' | 'webkit' | 'firefox';
}
export declare function launch(options: LaunchOptions): Promise<Code>;
export declare class Code {
    readonly logger: Logger;
    private readonly mainProcess;
    readonly driver: PlaywrightDriver;
    constructor(driver: PlaywrightDriver, logger: Logger, mainProcess: cp.ChildProcess);
    startTracing(name: string): Promise<void>;
    stopTracing(name: string, persist: boolean): Promise<void>;
    dispatchKeybinding(keybinding: string): Promise<void>;
    didFinishLoad(): Promise<void>;
    exit(): Promise<void>;
    waitForTextContent(selector: string, textContent?: string, accept?: (result: string) => boolean, retryCount?: number): Promise<string>;
    waitAndClick(selector: string, xoffset?: number, yoffset?: number, retryCount?: number): Promise<void>;
    waitForSetValue(selector: string, value: string): Promise<void>;
    waitForElements(selector: string, recursive: boolean, accept?: (result: IElement[]) => boolean): Promise<IElement[]>;
    waitForElement(selector: string, accept?: (result: IElement | undefined) => boolean, retryCount?: number): Promise<IElement>;
    waitForActiveElement(selector: string, retryCount?: number): Promise<void>;
    waitForTitle(accept: (title: string) => boolean): Promise<void>;
    waitForTypeInEditor(selector: string, text: string): Promise<void>;
    waitForTerminalBuffer(selector: string, accept: (result: string[]) => boolean): Promise<void>;
    writeInTerminal(selector: string, value: string): Promise<void>;
    getLocaleInfo(): Promise<ILocaleInfo>;
    getLocalizedStrings(): Promise<ILocalizedStrings>;
    getLogs(): Promise<ILogFile[]>;
    wait(millis: number): Promise<void>;
    private poll;
}
export declare function findElement(element: IElement, fn: (element: IElement) => boolean): IElement | null;
export declare function findElements(element: IElement, fn: (element: IElement) => boolean): IElement[];
