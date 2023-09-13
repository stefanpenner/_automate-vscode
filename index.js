const { _electron: electron } = require('playwright');
const {
  FileLogger,
  Code,
  Workbench,
} = require('vscode-automation');

const { join } = require('path');

const {
  PlaywrightDriver
} = require('vscode-automation/out/playwrightDriver');

const setup = require('./setup');

(async () => {
  const logger = new FileLogger(__dirname + '/logs');

  // codePath?: string;
  // readonly workspacePath: string;
  // userDataDir: string;
  // readonly extensionsPath: string;
  // readonly logger: Logger;
  // logsPath: string;
  // crashesPath: string;
  // readonly verbose?: boolean;
  // readonly extraArgs?: string[];
  // readonly remote?: boolean;
  // readonly web?: boolean;
  // readonly tracing?: boolean;
  // readonly headless?: boolean;
  // readonly browser?: 'chromium' | 'webkit' | 'firefox';
  const options = {
    logger,
    tracing: false,
    logsPath: __dirname + '/logs',
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

  // TODO: we need to wait for something to be ready..
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(1)
  await workbench.editors.newUntitledFile();
  console.log(2)
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(3)
  await workbench.editors.newUntitledFile();
  console.log(4)
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(5)
  await workbench.editor.waitForTypeInEditor('Untitled-1', "Hello, World!");
  await workbench.editors.waitForTab('Untitled-1', true);

  // save
  // await workbench.editors.saveOpenedFile();

})();
