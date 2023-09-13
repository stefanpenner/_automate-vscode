/// <reference types="node" />
import { ChildProcess } from 'child_process';
import type { LaunchOptions } from './code';
import { PlaywrightDriver } from './playwrightDriver';
export declare function launch(options: LaunchOptions): Promise<{
    serverProcess: ChildProcess;
    driver: PlaywrightDriver;
}>;
