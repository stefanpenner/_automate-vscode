const { _electron: electron } = require('playwright');
const {
  FileLogger,
  Code,
  Workbench,
} = require('vscode-automation');

const {
  PlaywrightDriver
} = require('vscode-automation/out/playwrightDriver');

const setup = require('./setup');
const {
  mkdirSync,
  rmSync,
  writeFileSync,
} = require('fs');

function ensureDirSync(dir) {
  try {
    mkdirSync(dir)
  } catch (e) {
    if (typeof e === "object" && e !== null && e.code === "EEXIST") {
      // already exists
    } else {
      throw e;
    }
  }
}

(async () => {
  const root = `${__dirname}/root`;
  try {
    rmSync(root, { recursive: true })
  } catch (e) {
    if (typeof e === "object" && e !== null && e.code === "ENOENT") {
      // already doesn't exist
    }
  }

  // todo use node-fixturify
  ensureDirSync(root)
  ensureDirSync(`${root}/workspace`)

  writeFileSync(`${root}/workspace/foo.mjs`, `
import { bar } from './bar.mjs'

export function foo() { bar(); }
`)

  writeFileSync(`${root}/workspace/bar.mjs`, `
import { foo } from './foo.mjs'

export function bar() { foo(); }
`)


  const logger = new FileLogger(`${root}/log`);

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
    electron,
    appPath,
  } = await setup(options);

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
  globalThis.W = workbench

  // app ready (TODO: hide)
  await code.waitForElement('.explorer-folders-view');

  // test
  await workbench.quickaccess.openFile(`${root}/workspace/foo.mjs`);
  await workbench.editors.selectTab("foo.mjs");
  await workbench.editor.clickOnTerm("foo.mjs", "bar", 2);
  // TODO: smarter wait
  await new Promise(r => setTimeout(r, 1000));
  await workbench.quickaccess.runCommand("go to implementation");

  // TODO: rather then waiting, let's get immediate access to current tab and check that instead
  await workbench.editors.waitForActiveEditor('bar.mjs');
  debugger

  // is the right thing selected?
  globalThis.w = workbench
  globalThis.c = code
  // is the right thing selected?

  // TODO: save, how to close native dialog?
  // something that needs jump to definition
  // something that needs to run a test
  // something that needs to debug
})();
