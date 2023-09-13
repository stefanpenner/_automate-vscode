/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { Logger } from './logger';
export declare function teardown(p: ChildProcess, logger: Logger, retryCount?: number): Promise<void>;
