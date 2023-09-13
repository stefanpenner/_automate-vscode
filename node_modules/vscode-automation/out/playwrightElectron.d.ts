/// <reference types="node" />
import type { LaunchOptions } from './code';
import { PlaywrightDriver } from './playwrightDriver';
import { ChildProcess } from 'child_process';
export declare function launch(options: LaunchOptions): Promise<{
    electronProcess: ChildProcess;
    driver: PlaywrightDriver;
}>;
