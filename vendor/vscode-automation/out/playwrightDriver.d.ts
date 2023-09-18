/// <reference types="node" />
import * as playwright from '@playwright/test';
import { LaunchOptions } from './code';
import { ChildProcess } from 'child_process';
export declare class PlaywrightDriver {
    private readonly application;
    private readonly context;
    private readonly page;
    private readonly serverProcess;
    private readonly whenLoaded;
    private readonly options;
    private static traceCounter;
    private static screenShotCounter;
    private static readonly vscodeToPlaywrightKey;
    constructor(application: playwright.Browser | playwright.ElectronApplication, context: playwright.BrowserContext, page: playwright.Page, serverProcess: ChildProcess | undefined, whenLoaded: Promise<unknown>, options: LaunchOptions);
    startTracing(name: string): Promise<void>;
    stopTracing(name: string, persist: boolean): Promise<void>;
    didFinishLoad(): Promise<void>;
    private takeScreenshot;
    reload(): Promise<void>;
    exitApplication(): Promise<void>;
    private saveWebClientLogs;
    dispatchKeybinding(keybinding: string): Promise<void>;
    click(selector: string, xoffset?: number | undefined, yoffset?: number | undefined): Promise<void>;
    setValue(selector: string, text: string): Promise<void>;
    getTitle(): Promise<string>;
    isActiveElement(selector: string): Promise<boolean>;
    getElements(selector: string, recursive?: boolean): Promise<import("./driver").IElement[]>;
    getElementXY(selector: string, xoffset?: number, yoffset?: number): Promise<{
        x: number;
        y: number;
    }>;
    typeInEditor(selector: string, text: string): Promise<void>;
    getTerminalBuffer(selector: string): Promise<string[]>;
    writeInTerminal(selector: string, text: string): Promise<void>;
    getLocaleInfo(): Promise<import("./driver").ILocaleInfo>;
    getLocalizedStrings(): Promise<import("./driver").ILocalizedStrings>;
    getLogs(): Promise<import("./driver").ILogFile[]>;
    private evaluateWithDriver;
    wait(ms: number): Promise<void>;
    private getDriverHandle;
}
