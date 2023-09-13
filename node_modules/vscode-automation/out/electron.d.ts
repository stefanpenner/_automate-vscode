/// <reference types="node" />
import type { LaunchOptions } from './code';
export interface IElectronConfiguration {
    readonly electronPath: string;
    readonly args: string[];
    readonly env?: NodeJS.ProcessEnv;
}
export declare function resolveElectronConfiguration(options: LaunchOptions): Promise<IElectronConfiguration>;
export declare function getDevElectronPath(): string;
export declare function getBuildElectronPath(root: string): string;
export declare function getBuildVersion(root: string): string;
