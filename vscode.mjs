import { _electron } from 'playwright';
import vscodeAutomation from 'vscode-automation';

const {
  FileLogger,
  Code,
  Workbench,
} = vscodeAutomation;

import p from "vscode-automation/out/playwrightDriver.js"
const { PlaywrightDriver } = p;

import { setup } from './setup.mjs';

export async function vscode(root, fn) {
  const logger = new FileLogger(`${root}/log`);

  const last_workbench = globalThis.WORKBENCH;
  const last_code = globalThis.CODE;
  let electron = null;


  try {
    // codePath?: string;
    // workspacePath: string;
    // userDataDir: string;
    // extensionsPath: string;
    // logger: Logger;
    // logsPath: string;
    // crashesPath: string;
    // verbose?: boolean;
    // extraArgs?: string[];
    // remote?: boolean;
    // web?: boolean;
    // tracing?: boolean;
    // headless?: boolean;
    // browser?: 'chromium' | 'webkit' | 'firefox';
    const options = {
      logger,
      tracing: false,
      logsPath: `${root}/logs`,
      workspacePath: `${root}/workspace`,
      userDataDir: `${root}/user_data`,
      extensionsPath: `${root}/extensions`,
      crashesPath: `${root}/crashes`,
    };

    const {
      window,
      context,
      electron: _electron,
    } = await setup(options);

    electron = _electron;
    const driver = new PlaywrightDriver(
      electron,
      context,
      window,
      undefined /* no server process */,
      Promise.resolve() /* Window is open already */,
      options
    );

    const code = new Code(driver, logger, electron.process())
    const workbench = new Workbench(code);

    // for easier debugging
    globalThis.WORKBENCH = workbench
    globalThis.CODE = code

    // wait for VSCode to be ready
    await code.waitForElement('.explorer-folders-view');

    // invoke user-land
    await fn({
      code,
      workbench,
      root,
      driver
    });
    // cleanup
  } finally {
    if (electron) {
      await electron.close()
    }
    globalThis.WORKBENCH = last_workbench;
    globalThis.CODE = last_code;
  }
}

